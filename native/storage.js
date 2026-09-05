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
 */
export async function listFolder(uri) {
  if (!uri) return [];
  try {
    const entries = await SafX.listFiles(uri);
    return Array.isArray(entries) ? entries : [];
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
  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const cacheFile = `${FileSystem.cacheDirectory}saf_${safeName}`;

  try {
    // 3. If already on disk, reuse it
    const info = await FileSystem.getInfoAsync(cacheFile);
    if (info.exists) {
      _fileCache.set(contentUri, cacheFile);
      return cacheFile;
    }

    // 4. Read from SAF and write to local cache
    const base64 = await SafX.readFile(contentUri, {encoding: 'base64'});
    await FileSystem.writeAsStringAsync(cacheFile, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    _fileCache.set(contentUri, cacheFile);
    return cacheFile;
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