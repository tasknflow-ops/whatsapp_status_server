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

/**
 * Launch the system folder picker so the user can grant the .Statuses folder.
 * `persist: true` asks Android to remember the grant across reboots.
 * Returns the granted content URI string, or null if the user cancelled.
 */
export async function pickStatusesFolder() {
  try {
    // ⚠️ VERIFY: method name / signature against installed saf-x version
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
    // ⚠️ VERIFY: some versions expose hasPermission, others persistedUriPermissions()
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
    // ⚠️ VERIFY: listFiles(uri) return shape
    const entries = await SafX.listFiles(uri);
    return Array.isArray(entries) ? entries : [];
  } catch (e) {
    console.warn('listFiles failed', e);
    return [];
  }
}

/**
 * Save a status file to the device gallery.
 * SAF files live behind content:// URIs that CameraRoll can't always read
 * directly, so we copy the bytes to a temp cache file first, then hand that
 * path to CameraRoll.save with the correct album + type.
 *
 * `file` is a normalised entry: { uri, name, mediaType }
 * Returns true on success.
 */
export async function saveToGallery(file) {
  let cacheFile = null;
  try {
    const base64Data = await SafX.readFile(file.uri, {encoding: 'base64'});
    cacheFile = `${FileSystem.cacheDirectory}${Date.now()}_${file.name}`;
    await FileSystem.writeAsStringAsync(cacheFile, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const type = file.mediaType === 'video' ? 'video' : 'photo';
    await CameraRoll.save(cacheFile, {type, album: SAVED_FOLDER_NAME});
    return true;
  } catch (e) {
    console.warn('saveToGallery failed', e);
    return false;
  } finally {
    if (cacheFile) {
      try {
        await FileSystem.deleteAsync(cacheFile, {idempotent: true});
      } catch {
        // Ignore cache cleanup errors
      }
    }
  }
}