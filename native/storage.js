/**
 * Thin wrapper around react-native-saf-x + CameraRoll.
 * Everything that touches the Android Storage Access Framework lives here so
 * the rest of the app deals in plain JS objects, not content URIs.
 *
 * react-native-saf-x API used:
 *   openDocumentTree(persist: boolean)        -> { uri } | null   (folder picker)
 *   listFiles(uri)                            -> DocumentFileDetail[]
 *   readFile(uri, { encoding })               -> string
 *   hasPermission(uri)                        -> boolean
 */
import * as SafX from 'react-native-saf-x';
import * as FileSystem from 'expo-file-system';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {SAVED_FOLDER_NAME} from '../utils/constants';

// ---------------------------------------------------------------------------
// In-memory cache: content:// URI -> file:// path
// Avoids re-reading the same file more than once per app session.
// ---------------------------------------------------------------------------
const _fileCache = new Map();

/**
 * Launch the system folder picker so the user can grant the .Statuses folder.
 * `persist: true` asks Android to remember the grant across reboots.
 * Returns the granted content URI string, or null if the user cancelled.
 */
export async function pickStatusesFolder() {
  try {
    const result = await SafX.openDocumentTree(true);
    if (result && result.uri) return result.uri;
    return null;
  } catch (e) {
    console.warn('openDocumentTree failed', e);
    return null;
  }
}

/**
 * Verify we still hold a persisted grant for this URI (user could revoke it
 * in system settings, or it may not survive certain updates).
 */
export async function stillHasPermission(uri) {
  if (!uri) return false;
  try {
    return await SafX.hasPermission(uri);
  } catch (e) {
    return false;
  }
}

/**
 * List raw entries in the granted folder. Returns [] on any failure so the
 * UI can show an empty state rather than crashing.
 *
 * Smart resolution:
 * - If user selected .Statuses directly -> returns files in .Statuses
 * - If user selected Media folder -> automatically finds .Statuses inside Media and returns its files
 * - If user selected WhatsApp folder -> finds Media -> .Statuses
 * - If user selected com.whatsapp folder -> finds WhatsApp -> Media -> .Statuses
 */
export async function listFolder(uri) {
  if (!uri) return [];
  try {
    const entries = await SafX.listFiles(uri);
    if (!Array.isArray(entries) || entries.length === 0) return [];

    // 1. Check if the selected folder directly contains a .Statuses subfolder (e.g. user selected 'Media'):
    const statusesDir = entries.find(
      e => e.type === 'directory' && (e.name === '.Statuses' || e.name === 'Statuses'),
    );
    if (statusesDir?.uri) {
      const statusFiles = await SafX.listFiles(statusesDir.uri);
      if (Array.isArray(statusFiles)) {
        return statusFiles;
      }
    }

    // 2. Check if user selected WhatsApp root containing 'Media':
    const mediaDir = entries.find(
      e => e.type === 'directory' && e.name === 'Media',
    );
    if (mediaDir?.uri) {
      const mediaEntries = await SafX.listFiles(mediaDir.uri);
      if (Array.isArray(mediaEntries)) {
        const subStatuses = mediaEntries.find(
          e => e.type === 'directory' && (e.name === '.Statuses' || e.name === 'Statuses'),
        );
        if (subStatuses?.uri) {
          const statusFiles = await SafX.listFiles(subStatuses.uri);
          if (Array.isArray(statusFiles)) {
            return statusFiles;
          }
        }
      }
    }

    // 3. Check if user selected com.whatsapp containing 'WhatsApp':
    const waDir = entries.find(
      e => e.type === 'directory' && (e.name === 'WhatsApp' || e.name === 'WhatsApp Business'),
    );
    if (waDir?.uri) {
      const waEntries = await SafX.listFiles(waDir.uri);
      if (Array.isArray(waEntries)) {
        const subMedia = waEntries.find(
          e => e.type === 'directory' && e.name === 'Media',
        );
        if (subMedia?.uri) {
          const mediaEntries = await SafX.listFiles(subMedia.uri);
          if (Array.isArray(mediaEntries)) {
            const subStatuses = mediaEntries.find(
              e => e.type === 'directory' && (e.name === '.Statuses' || e.name === 'Statuses'),
            );
            if (subStatuses?.uri) {
              const statusFiles = await SafX.listFiles(subStatuses.uri);
              if (Array.isArray(statusFiles)) {
                return statusFiles;
              }
            }
          }
        }
      }
    }

    // 4. If .Statuses was not in the directory listing (e.g. hidden on some devices), try direct subpath:
    try {
      const direct = await SafX.listFiles(`${uri}/.Statuses`);
      if (Array.isArray(direct) && direct.length > 0) {
        return direct;
      }
    } catch (_) {}

    // 5. Default: user selected .Statuses directly or folder with status files
    return entries;
  } catch (e) {
    console.warn('listFiles failed', e);
    return [];
  }
}

/**
 * Copies a SAF content:// file to the app's local cache directory and returns
 * a file:// URI that React Native's <Image> and <Video> can render directly.
 *
 * Results are stored in _fileCache so repeated calls for the same URI are
 * instant (no re-read from SAF). The cache persists for the app session only.
 *
 * @param {string} contentUri  - SAF content:// URI
 * @param {string} name        - original filename (e.g. "img-20240901.jpg")
 * @returns {Promise<string|null>} file:// path or null on failure
 */
export async function getCachedFileUri(contentUri, name) {
  // 1. In-memory hit
  if (_fileCache.has(contentUri)) {
    return _fileCache.get(contentUri);
  }

  // 2. Use a stable cache filename so it survives between JS reloads
  const safeName = (name || 'status_file').replace(/[^a-zA-Z0-9._-]/g, '_');
  const cacheFile = `${FileSystem.cacheDirectory}saf_${safeName}`;

  try {
    // 3. If already on disk and not empty, reuse it
    const info = await FileSystem.getInfoAsync(cacheFile);
    if (info.exists) {
      if (info.size > 0) {
        _fileCache.set(contentUri, cacheFile);
        return cacheFile;
      }
      try {
        await FileSystem.deleteAsync(cacheFile, {idempotent: true});
      } catch (_) {}
    }

    // 4. Try stream copy via FileSystem first (fastest, preserves all bytes)
    try {
      await FileSystem.copyAsync({
        from: contentUri,
        to: cacheFile,
      });
      const check = await FileSystem.getInfoAsync(cacheFile);
      if (check.exists && check.size > 0) {
        _fileCache.set(contentUri, cacheFile);
        return cacheFile;
      }
    } catch (_copyErr) {
      // fallback to SAF read below
    }

    // 5. Fallback: Read from SAF and write to local cache
    const base64 = await SafX.readFile(contentUri, {encoding: 'base64'});
    if (base64 && base64.length > 0) {
      await FileSystem.writeAsStringAsync(cacheFile, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      _fileCache.set(contentUri, cacheFile);
      return cacheFile;
    }

    return null;
  } catch (e) {
    console.warn('getCachedFileUri failed for', name, e);
    return null;
  }
}

/**
 * Save a status file to the device gallery.
 * Reuses the local cache file if already present to avoid re-reading from SAF.
 *
 * `file` is a normalised entry: { uri, name, mediaType }
 * Returns true on success.
 */
export async function saveToGallery(file) {
  try {
    // Reuse cache if available, otherwise copy fresh
    const localPath = await getCachedFileUri(file.uri, file.name);
    if (!localPath) throw new Error('Could not obtain local file path');

    const type = file.mediaType === 'video' ? 'video' : 'photo';
    await CameraRoll.save(localPath, {type, album: SAVED_FOLDER_NAME});
    return true;
  } catch (e) {
    console.warn('saveToGallery failed', e);
    return false;
  }
}