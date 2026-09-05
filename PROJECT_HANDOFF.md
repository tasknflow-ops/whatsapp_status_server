# WhatsApp Status Saver — Project Handoff

> Paste this whole file into a new Claude chat to continue exactly where we left off.

## What this project is
A React Native (Expo) Android app that lets users **save WhatsApp statuses** (photos + videos) to their gallery. Statuses are read on-device from WhatsApp's `.Statuses` folder via Android's **Storage Access Framework (SAF)** — no backend, no scraping, nothing leaves the phone.

Scope was deliberately narrowed from an original (WhatsApp + Instagram + Facebook) idea down to **WhatsApp only**, because IG/FB downloading violates Meta ToS and gets apps removed. WhatsApp status saving is the clean, storable one.

## Locked decisions
- **Platform:** Android only (iOS can't access WhatsApp's files).
- **Framework:** Expo + **Development Build** via EAS (NOT Expo Go — Expo Go can't load the native SAF module). Chosen so no local Android SDK / Android Studio is needed; native compile happens in the cloud.
- **Storage access:** SAF folder picker (`react-native-saf-x`). User grants the `.Statuses` folder once; URI is persisted. Deliberately NOT using `MANAGE_EXTERNAL_STORAGE` (Play Store rejects it).
- **SDK targets:** minSdk 24, targetSdk 34.
- **Apps supported:** both WhatsApp (`com.whatsapp`) and WhatsApp Business (`com.whatsapp.w4b`).
- **UI:** WhatsApp-green theme; bottom tabs = Images / Videos / Saved; tap a thumbnail → fullscreen Preview; Save button copies to gallery.
- **State:** Zustand + AsyncStorage (persists the granted folder URI).
- **Dev environment:** Windows, VS Code, testing on a physical **Motorola** phone (Moto ≈ stock Android, SAF picker behaves normally).

## Dependencies (already installed by the user)
```
react-native-saf-x
@react-native-camera-roll/camera-roll
react-native-video
@react-navigation/native
@react-navigation/native-stack
@react-navigation/bottom-tabs
react-native-screens
react-native-safe-area-context
react-native-gesture-handler
@react-native-async-storage/async-storage
zustand
expo-dev-client
```

## Folder structure
```
WhatsAppStatusSaver/
├── App.js
├── app.json
├── package.json
├── eas.json
├── babel.config.js
├── metro.config.js
├── index.js
├── .gitignore
├── android/
│   └── app/src/main/
│       └── AndroidManifest.xml
└── src/
    ├── components/  EmptyState.js  PermissionGate.js  StatusGrid.js  StatusItem.js
    ├── hooks/       useDownload.js  useSafPermission.js  useStatusFiles.js
    ├── native/      storage.js
    ├── navigation/  AppNavigator.js  Tabs.js
    ├── screens/
    │   ├── Home/    StatusListScreen.js
    │   ├── Images/  ImagesScreen.js
    │   ├── Videos/  VideosScreen.js
    │   ├── Preview/ PreviewScreen.js
    │   └── Saved/   SavedScreen.js
    ├── store/       useAppStore.js
    └── utils/       constants.js  fileUtils.js  theme.js
```

## ⚠️ Known caveats / things to verify on device
1. **`src/native/storage.js` — the saf-x API calls are the #1 risk.** Method names (`openDocumentTree`, `hasPermission`, `listFiles`, `copyToCacheFile`) were written from memory and vary by library version. Verify against the installed `react-native-saf-x` README before trusting. Marked with `⚠️ VERIFY` comments.
2. **saf-x as an Expo config plugin.** `app.json` lists `["react-native-saf-x", {}]`. If EAS build errors that saf-x has no plugin, remove it from plugins and run `npx expo prebuild`, or add a small custom plugin.
3. **CameraRoll `getPhotos` / `save` option shapes** (in `storage.js` + `SavedScreen.js`) — check against installed version.
4. **Video thumbnails** in the grid may show a dark placeholder (SAF URIs don't always yield a still frame). Functional, just not pretty — a thumbnail lib can be added later.
5. **Change the package name** in `app.json` from `com.yourname.statussaver` to something unique.

## Build & run
```powershell
# in project root
npx expo login
eas build:configure
eas build --profile development --platform android   # produces dev-build APK link
# install that APK on the Moto, then:
npx expo start --dev-client                          # scan QR
```
Before testing: open WhatsApp and VIEW a few statuses (photos + videos) so the `.Statuses` folder has content. Statuses vanish after 24h.

## Where we are in the build
All application source files, native configurations, manifests, and root build configs are complete and documented in full below.

**Next actions:**
1. Fix `storage.js` by replacing the non-existent `SafX.copyToCacheFile` helper with a working cache-to-gallery strategy.
2. Confirm package name in `app.json` (replace `com.yourname.statussaver`).
3. Ensure root configuration files are synchronized with your active environment.
4. Run `eas build:configure` and trigger the development build.

---
# FULL SOURCE — every file


## `app.json`

```json
{
  "expo": {
    "name": "Status Saver",
    "slug": "whatsapp-status-saver",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "newArchEnabled": false,
    "splash": {
      "resizeMode": "contain",
      "backgroundColor": "#075E54"
    },
    "assetBundlePatterns": ["**/*"],
    "android": {
      "package": "com.yourname.statussaver",
      "versionCode": 1,
      "permissions": [
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.READ_MEDIA_VIDEO"
      ],
      "blockedPermissions": [
        "android.permission.MANAGE_EXTERNAL_STORAGE"
      ]
    },
    "plugins": [
      "expo-dev-client",
      [
        "react-native-saf-x",
        {}
      ]
    ]
  }
}
```

## `App.js`

```javascript
import React, {useEffect} from 'react';
import {View, ActivityIndicator, StyleSheet, StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import PermissionGate from './src/components/PermissionGate';
import {useSafPermission} from './src/hooks/useSafPermission';
import {useAppStore} from './src/store/useAppStore';
import {colors} from './src/utils/theme';

export default function App() {
  const hydrate = useAppStore(s => s.hydrate);
  const hydrated = useAppStore(s => s.hydrated);
  const {isGranted, checking, requestAccess} = useSafPermission();

  // Load the persisted folder grant on boot.
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const booting = !hydrated || checking;

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
        {booting ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : isGranted ? (
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        ) : (
          <PermissionGate onGrant={requestAccess} checking={checking} />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg},
});
```

## `src/utils/constants.js`

```javascript
// Central place for paths, extensions and app-wide constants.

// SAF content-URI hints. When the user opens the folder picker we try to
// pre-navigate to these WhatsApp .Statuses locations. Modern WhatsApp
// (2021+) keeps statuses under Android/media; older builds used the root path.
export const WHATSAPP_PACKAGES = {
  WA: 'com.whatsapp',
  WA_BUSINESS: 'com.whatsapp.w4b',
};

// Candidate relative paths to the .Statuses folder, newest layout first.
// These are shown to the user as guidance and used to build initial-URI hints.
export const STATUS_PATHS = [
  'Android/media/com.whatsapp/WhatsApp/Media/.Statuses',
  'Android/media/com.whatsapp.w4b/WhatsApp Business/Media/.Statuses',
  'WhatsApp/Media/.Statuses', // legacy (pre-Android 11)
];

export const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp'];
export const VIDEO_EXTS = ['mp4', 'mkv', '3gp', 'mov'];

// Folder inside public storage where we copy saved statuses.
export const SAVED_FOLDER_NAME = 'StatusSaver';

// Key used to persist the granted SAF folder URI (via zustand + storage).
export const PERSISTED_URI_KEY = 'saf_statuses_uri';

export const MEDIA_TYPE = {
  IMAGE: 'image',
  VIDEO: 'video',
  UNKNOWN: 'unknown',
};

export function extFromName(name = '') {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase();
}

export function mediaTypeFromName(name = '') {
  const ext = extFromName(name);
  if (IMAGE_EXTS.includes(ext)) return MEDIA_TYPE.IMAGE;
  if (VIDEO_EXTS.includes(ext)) return MEDIA_TYPE.VIDEO;
  return MEDIA_TYPE.UNKNOWN;
}
```

## `src/utils/theme.js`

```javascript
// Central theme. WhatsApp-familiar green palette so the app feels native to
// the context it's used in.

export const colors = {
  primary: '#075E54', // WhatsApp dark teal (headers, tab bar active)
  primaryDark: '#054d44',
  accent: '#25D366', // WhatsApp bright green (buttons, highlights)
  accentDark: '#1da851',
  bg: '#ECE5DD', // WhatsApp chat background beige
  surface: '#FFFFFF',
  text: '#111B21',
  textMuted: '#667781',
  border: '#E1E4E6',
  danger: '#E53935',
  overlay: 'rgba(0,0,0,0.55)',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};

export const typography = {
  title: {fontSize: 20, fontWeight: '700', color: colors.text},
  subtitle: {fontSize: 15, fontWeight: '600', color: colors.text},
  body: {fontSize: 14, color: colors.text},
  muted: {fontSize: 13, color: colors.textMuted},
};
```

## `src/utils/fileUtils.js`

```javascript
import {MEDIA_TYPE, mediaTypeFromName} from './constants';

// Normalises a raw SAF file entry into the shape the UI expects.
// react-native-saf-x listFiles returns objects like:
// { name, uri, type: 'file'|'directory', lastModified, size, mime }
export function normaliseEntry(entry) {
  return {
    name: entry.name,
    uri: entry.uri,
    size: entry.size ?? 0,
    lastModified: entry.lastModified ?? 0,
    mime: entry.mime ?? '',
    mediaType: mediaTypeFromName(entry.name),
    isDir: entry.type === 'directory',
  };
}

// Keep only real media files, drop the ".nomedia" marker and directories.
export function onlyMedia(entries) {
  return entries
    .map(normaliseEntry)
    .filter(e => !e.isDir && e.mediaType !== MEDIA_TYPE.UNKNOWN);
}

// Newest first.
export function sortByNewest(items) {
  return [...items].sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
}

// WhatsApp can duplicate the same status across WA + WA Business, or across
// re-scans. Dedupe by name + size, which is stable for identical media.
export function dedupe(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = `${it.name}::${it.size}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

export function splitByType(items) {
  const images = [];
  const videos = [];
  for (const it of items) {
    if (it.mediaType === MEDIA_TYPE.IMAGE) images.push(it);
    else if (it.mediaType === MEDIA_TYPE.VIDEO) videos.push(it);
  }
  return {images, videos};
}

// Full pipeline used by the listing hook.
export function processStatusEntries(rawEntries) {
  const media = onlyMedia(rawEntries);
  const unique = dedupe(media);
  const sorted = sortByNewest(unique);
  return {all: sorted, ...splitByType(sorted)};
}
```

## `src/store/useAppStore.js`

```javascript
import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {PERSISTED_URI_KEY} from '../utils/constants';

// Small global store. The one thing we MUST persist across launches is the
// SAF folder URI the user granted for the .Statuses folder — re-asking every
// launch would be terrible UX. Saved-file listings are in-memory only.

export const useAppStore = create((set, get) => ({
  // ---- SAF grant ----
  statusesUri: null, // persisted content:// URI for the .Statuses folder
  hydrated: false, // becomes true once we've read AsyncStorage on boot

  setStatusesUri: async uri => {
    set({statusesUri: uri});
    try {
      if (uri) await AsyncStorage.setItem(PERSISTED_URI_KEY, uri);
      else await AsyncStorage.removeItem(PERSISTED_URI_KEY);
    } catch (e) {
      // Non-fatal: the app still works this session, just won't remember next launch.
      console.warn('Failed to persist SAF URI', e);
    }
  },

  hydrate: async () => {
    try {
      const uri = await AsyncStorage.getItem(PERSISTED_URI_KEY);
      set({statusesUri: uri || null, hydrated: true});
    } catch (e) {
      console.warn('Failed to hydrate SAF URI', e);
      set({hydrated: true});
    }
  },

  clearGrant: async () => {
    set({statusesUri: null});
    try {
      await AsyncStorage.removeItem(PERSISTED_URI_KEY);
    } catch (e) {
      console.warn('Failed to clear SAF URI', e);
    }
  },

  // ---- loading flags shared across screens ----
  isScanning: false,
  setScanning: v => set({isScanning: v}),

  // ---- saved files (populated by the Saved screen) ----
  savedFiles: [],
  setSavedFiles: files => set({savedFiles: files}),
}));
```

## `src/native/storage.js`

```javascript
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
 *   createFile / copyFile ... (we use readFile + CameraRoll to save)
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
 * Save a status file to the device gallery.
 * SAF files live behind content:// URIs that CameraRoll can't read directly,
 * so we read the base64 content via SafX.readFile and write it to a temporary
 * cache file via FileSystem, then hand that local file:// URI to CameraRoll.save.
 * After saving, we clean up the cache file.
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
```

## `src/hooks/useSafPermission.js`

```javascript
import {useCallback, useEffect, useState} from 'react';
import {useAppStore} from '../store/useAppStore';
import {pickStatusesFolder, stillHasPermission} from '../native/storage';

/**
 * Manages the one-time SAF folder grant for the WhatsApp .Statuses folder.
 *
 * Exposes:
 *   isGranted      - do we currently hold a usable grant?
 *   checking       - verifying an existing grant on mount
 *   requestAccess  - open the system folder picker
 *   revoke         - forget the grant (user can re-grant later)
 */
export function useSafPermission() {
  const statusesUri = useAppStore(s => s.statusesUri);
  const hydrated = useAppStore(s => s.hydrated);
  const setStatusesUri = useAppStore(s => s.setStatusesUri);
  const clearGrant = useAppStore(s => s.clearGrant);

  const [checking, setChecking] = useState(true);
  const [isGranted, setIsGranted] = useState(false);

  // Once the store has hydrated the saved URI, verify it's still valid.
  useEffect(() => {
    let active = true;
    async function verify() {
      if (!hydrated) return;
      if (!statusesUri) {
        if (active) {
          setIsGranted(false);
          setChecking(false);
        }
        return;
      }
      const ok = await stillHasPermission(statusesUri);
      if (!active) return;
      if (!ok) {
        // Grant went stale — forget it so the UI prompts again.
        await clearGrant();
        setIsGranted(false);
      } else {
        setIsGranted(true);
      }
      setChecking(false);
    }
    verify();
    return () => {
      active = false;
    };
  }, [hydrated, statusesUri, clearGrant]);

  const requestAccess = useCallback(async () => {
    const uri = await pickStatusesFolder();
    if (uri) {
      await setStatusesUri(uri);
      setIsGranted(true);
      return true;
    }
    return false;
  }, [setStatusesUri]);

  const revoke = useCallback(async () => {
    await clearGrant();
    setIsGranted(false);
  }, [clearGrant]);

  return {isGranted, checking, requestAccess, revoke, statusesUri};
}
```

## `src/hooks/useStatusFiles.js`

```javascript
import {useCallback, useEffect, useState} from 'react';
import {useAppStore} from '../store/useAppStore';
import {listFolder} from '../native/storage';
import {processStatusEntries} from '../utils/fileUtils';

/**
 * Reads the granted .Statuses folder and returns processed media, split into
 * images and videos. Re-runnable via refresh() (pull-to-refresh).
 *
 * Returns: { all, images, videos, loading, error, refresh }
 */
export function useStatusFiles() {
  const statusesUri = useAppStore(s => s.statusesUri);
  const setScanning = useAppStore(s => s.setScanning);

  const [data, setData] = useState({all: [], images: [], videos: []});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!statusesUri) {
      setData({all: [], images: [], videos: []});
      return;
    }
    setLoading(true);
    setScanning(true);
    setError(null);
    try {
      const raw = await listFolder(statusesUri);
      setData(processStatusEntries(raw));
    } catch (e) {
      setError(e?.message || 'Failed to read statuses');
      setData({all: [], images: [], videos: []});
    } finally {
      setLoading(false);
      setScanning(false);
    }
  }, [statusesUri, setScanning]);

  // Auto-load whenever the granted folder becomes available/changes.
  useEffect(() => {
    load();
  }, [load]);

  return {...data, loading, error, refresh: load};
}
```

## `src/hooks/useDownload.js`

```javascript
import {useCallback, useState} from 'react';
import {Alert} from 'react-native';
import {saveToGallery} from '../native/storage';

/**
 * Handles saving a status file to the gallery, tracking which item is
 * currently saving so the UI can show a spinner on just that card.
 *
 * Returns: { save, savingUri }
 *   save(file)  -> Promise<boolean>
 *   savingUri   -> uri of the item currently saving, or null
 */
export function useDownload() {
  const [savingUri, setSavingUri] = useState(null);

  const save = useCallback(async file => {
    if (!file?.uri) return false;
    setSavingUri(file.uri);
    try {
      const ok = await saveToGallery(file);
      if (ok) {
        Alert.alert('Saved', 'Status saved to your gallery.');
      } else {
        Alert.alert('Could not save', 'Something went wrong saving this file.');
      }
      return ok;
    } finally {
      setSavingUri(null);
    }
  }, []);

  return {save, savingUri};
}
```

## `src/components/PermissionGate.js`

```javascript
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {colors, spacing, radius, typography} from '../utils/theme';

/**
 * Shown when we don't yet hold a folder grant. Explains the flow, then opens
 * the system folder picker via onGrant.
 */
export default function PermissionGate({onGrant, checking}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>📁</Text>
      </View>

      <Text style={styles.title}>Allow access to statuses</Text>

      <Text style={styles.body}>
        To show statuses, this app needs one-time access to WhatsApp's{' '}
        <Text style={styles.bold}>.Statuses</Text> folder.
      </Text>

      <View style={styles.steps}>
        <Step n="1" text="Open WhatsApp and view a few statuses first." />
        <Step n="2" text="Tap the button below to open the folder picker." />
        <Step
          n="3"
          text="Navigate to Android → media → com.whatsapp → WhatsApp → Media → .Statuses, then tap “Use this folder”."
        />
      </View>

      <TouchableOpacity
        style={[styles.button, checking && styles.buttonDisabled]}
        onPress={onGrant}
        disabled={checking}
        activeOpacity={0.85}>
        <Text style={styles.buttonText}>
          {checking ? 'Checking…' : 'Grant folder access'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Your files never leave your phone. Statuses disappear after 24 hours —
        save the ones you want to keep.
      </Text>
    </ScrollView>
  );
}

function Step({n, text}) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{n}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.bg,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    elevation: 2,
  },
  iconText: {fontSize: 40},
  title: {...typography.title, marginBottom: spacing.sm, textAlign: 'center'},
  body: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  bold: {fontWeight: '700'},
  steps: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  step: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md},
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepNumText: {color: colors.white, fontWeight: '700', fontSize: 13},
  stepText: {flex: 1, ...typography.body, lineHeight: 20},
  button: {
    alignSelf: 'stretch',
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  buttonDisabled: {opacity: 0.6},
  buttonText: {color: colors.white, fontWeight: '700', fontSize: 16},
  note: {...typography.muted, textAlign: 'center', lineHeight: 18},
});
```

## `src/components/EmptyState.js`

```javascript
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, spacing, radius, typography} from '../utils/theme';

export default function EmptyState({
  emoji = '🕓',
  title = 'No statuses found',
  message = 'Open WhatsApp, view some statuses, then pull down to refresh.',
  onRefresh,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRefresh ? (
        <TouchableOpacity style={styles.button} onPress={onRefresh} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emoji: {fontSize: 48, marginBottom: spacing.md},
  title: {...typography.subtitle, marginBottom: spacing.sm, textAlign: 'center'},
  message: {
    ...typography.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  buttonText: {color: colors.white, fontWeight: '700'},
});
```

## `src/components/StatusItem.js`

```javascript
import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {colors, spacing, radius} from '../utils/theme';
import {MEDIA_TYPE} from '../utils/constants';

const GAP = spacing.sm;
const COLS = 2;
const size = (Dimensions.get('window').width - GAP * (COLS + 1)) / COLS;

/**
 * One status thumbnail. Tapping the image opens the preview (onPress);
 * tapping the save pill downloads it (onSave). `saving` shows a spinner.
 *
 * For videos we still use the file URI as the Image source — many SAF
 * content URIs return a still frame; if a thumbnail doesn't render we show
 * the video badge over a dark placeholder.
 */
export default function StatusItem({item, onPress, onSave, saving}) {
  const isVideo = item.mediaType === MEDIA_TYPE.VIDEO;

  return (
    <View style={styles.cell}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(item)} style={styles.thumbWrap}>
        <Image source={{uri: item.uri}} style={styles.thumb} resizeMode="cover" />
        {isVideo ? (
          <View style={styles.playBadge}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        ) : null}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={() => onSave(item)}
        disabled={saving}
        activeOpacity={0.85}>
        {saving ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Text style={styles.saveText}>⬇ Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {width: size, marginBottom: GAP},
  thumbWrap: {
    width: size,
    height: size,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  thumb: {width: '100%', height: '100%'},
  playBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {color: colors.white, fontSize: 16, marginLeft: 2},
  saveBtn: {
    marginTop: spacing.xs,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
  },
  saveText: {color: colors.white, fontWeight: '700', fontSize: 13},
});
```

## `src/components/StatusGrid.js`

```javascript
import React from 'react';
import {FlatList, RefreshControl, StyleSheet, View} from 'react-native';
import StatusItem from './StatusItem';
import EmptyState from './EmptyState';
import {colors, spacing} from '../utils/theme';

/**
 * Reusable 2-column grid used by both the Images and Videos tabs.
 * Parent supplies the already-filtered list plus the handlers.
 */
export default function StatusGrid({
  items,
  loading,
  onRefresh,
  onPressItem,
  onSaveItem,
  savingUri,
  emptyProps,
}) {
  if (!loading && (!items || items.length === 0)) {
    return (
      <View style={styles.emptyWrap}>
        <EmptyState {...emptyProps} onRefresh={onRefresh} />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={it => it.uri}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      renderItem={({item}) => (
        <StatusItem
          item={item}
          onPress={onPressItem}
          onSave={onSaveItem}
          saving={savingUri === item.uri}
        />
      )}
      refreshControl={
        <RefreshControl
          refreshing={!!loading}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {padding: spacing.sm, backgroundColor: colors.bg, flexGrow: 1},
  row: {justifyContent: 'space-between'},
  emptyWrap: {flex: 1, backgroundColor: colors.bg},
});
```

## `src/screens/Home/StatusListScreen.js`

```javascript
import React from 'react';
import {View, StyleSheet} from 'react-native';
import StatusGrid from '../../components/StatusGrid';
import {useStatusFiles} from '../../hooks/useStatusFiles';
import {useDownload} from '../../hooks/useDownload';
import {colors} from '../../utils/theme';

/**
 * Shared implementation for the Images and Videos tabs.
 * `kind` is 'images' | 'videos' — selects which slice of useStatusFiles to show.
 */
export default function StatusListScreen({navigation, kind}) {
  const {images, videos, loading, refresh} = useStatusFiles();
  const {save, savingUri} = useDownload();

  const items = kind === 'videos' ? videos : images;

  const emptyProps =
    kind === 'videos'
      ? {
          emoji: '🎬',
          title: 'No video statuses',
          message:
            'View some video statuses in WhatsApp, then pull down to refresh.',
        }
      : {
          emoji: '🖼️',
          title: 'No image statuses',
          message:
            'View some photo statuses in WhatsApp, then pull down to refresh.',
        };

  const openPreview = item => {
    navigation.navigate('Preview', {item});
  };

  return (
    <View style={styles.container}>
      <StatusGrid
        items={items}
        loading={loading}
        onRefresh={refresh}
        onPressItem={openPreview}
        onSaveItem={save}
        savingUri={savingUri}
        emptyProps={emptyProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg},
});
```

## `src/screens/Images/ImagesScreen.js`

```javascript
import React from 'react';
import StatusListScreen from '../Home/StatusListScreen';

export default function ImagesScreen(props) {
  return <StatusListScreen {...props} kind="images" />;
}
```

## `src/screens/Videos/VideosScreen.js`

```javascript
import React from 'react';
import StatusListScreen from '../Home/StatusListScreen';

export default function VideosScreen(props) {
  return <StatusListScreen {...props} kind="videos" />;
}
```

## `src/screens/Preview/PreviewScreen.js`

```javascript
import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import {useDownload} from '../../hooks/useDownload';
import {colors, spacing, radius} from '../../utils/theme';
import {MEDIA_TYPE} from '../../utils/constants';

const {width, height} = Dimensions.get('window');

/**
 * Fullscreen preview. Route param `item` is a normalised status entry.
 * Images render with <Image>; videos with react-native-video (autoplay, loop).
 */
export default function PreviewScreen({route, navigation}) {
  const {item} = route.params;
  const {save, savingUri} = useDownload();
  const isVideo = item.mediaType === MEDIA_TYPE.VIDEO;
  const saving = savingUri === item.uri;

  return (
    <View style={styles.container}>
      <View style={styles.media}>
        {isVideo ? (
          <Video
            source={{uri: item.uri}}
            style={styles.video}
            controls
            repeat
            resizeMode="contain"
            paused={false}
          />
        ) : (
          <Image source={{uri: item.uri}} style={styles.image} resizeMode="contain" />
        )}
      </View>

      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={() => save(item)}
        disabled={saving}
        activeOpacity={0.85}>
        {saving ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.saveText}>⬇ Save to gallery</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000'},
  media: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  image: {width, height: height * 0.8},
  video: {width, height: height * 0.8},
  closeBtn: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {color: colors.white, fontSize: 18, fontWeight: '700'},
  saveBtn: {
    position: 'absolute',
    bottom: spacing.xl,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {color: colors.white, fontWeight: '700', fontSize: 15},
});
```

## `src/screens/Saved/SavedScreen.js`

```javascript
import React, {useCallback, useState} from 'react';
import {View, StyleSheet, FlatList, Image, Text, Dimensions} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import EmptyState from '../../components/EmptyState';
import {colors, spacing, radius} from '../../utils/theme';
import {SAVED_FOLDER_NAME} from '../../utils/constants';

const GAP = spacing.sm;
const size = (Dimensions.get('window').width - GAP * 3) / 2;

/**
 * Lists media already saved by this app. Reads the CameraRoll album named
 * SAVED_FOLDER_NAME. Refreshes each time the tab gains focus.
 *
 * NOTE: CameraRoll.getPhotos options/shape should be re-checked against the
 * installed @react-native-camera-roll/camera-roll version.
 */
export default function SavedScreen() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await CameraRoll.getPhotos({
        first: 200,
        assetType: 'All',
        groupTypes: 'Album',
        groupName: SAVED_FOLDER_NAME,
      });
      const mapped = res.edges.map(e => ({
        uri: e.node.image.uri,
        type: e.node.type,
      }));
      setItems(mapped);
    } catch (e) {
      // Album may not exist yet (nothing saved) — treat as empty.
      setItems([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loaded && items.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          emoji="💾"
          title="Nothing saved yet"
          message="Statuses you save will appear here and stay after 24 hours."
          onRefresh={load}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(it, i) => it.uri + i}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        renderItem={({item}) => (
          <View style={styles.cell}>
            <Image source={{uri: item.uri}} style={styles.thumb} resizeMode="cover" />
            {item.type && item.type.startsWith('video') ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>▶</Text>
              </View>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg},
  content: {padding: spacing.sm},
  row: {justifyContent: 'space-between'},
  cell: {
    width: size,
    height: size,
    marginBottom: GAP,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  thumb: {width: '100%', height: '100%'},
  badge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -18,
    marginLeft: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {color: colors.white, fontSize: 14},
});
```

## `src/navigation/Tabs.js`

```javascript
import React from 'react';
import {Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ImagesScreen from '../screens/Images/ImagesScreen';
import VideosScreen from '../screens/Videos/VideosScreen';
import SavedScreen from '../screens/Saved/SavedScreen';
import {colors} from '../utils/theme';

const Tab = createBottomTabNavigator();

// Emoji icons keep us dependency-free (no vector-icons native setup needed).
function tabIcon(emoji) {
  return ({focused}) => (
    <Text style={{fontSize: 20, opacity: focused ? 1 : 0.5}}>{emoji}</Text>
  );
}

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: colors.primary},
        headerTintColor: colors.white,
        headerTitleStyle: {fontWeight: '700'},
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {backgroundColor: colors.surface, height: 58, paddingBottom: 6},
      }}>
      <Tab.Screen
        name="Images"
        component={ImagesScreen}
        options={{title: 'Images', tabBarIcon: tabIcon('🖼️')}}
      />
      <Tab.Screen
        name="Videos"
        component={VideosScreen}
        options={{title: 'Videos', tabBarIcon: tabIcon('🎬')}}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{title: 'Saved', tabBarIcon: tabIcon('💾')}}
      />
    </Tab.Navigator>
  );
}
```

## `src/navigation/AppNavigator.js`

```javascript
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Tabs from './Tabs';
import PreviewScreen from '../screens/Preview/PreviewScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={Tabs} options={{headerShown: false}} />
      <Stack.Screen
        name="Preview"
        component={PreviewScreen}
        options={{headerShown: false, presentation: 'fullScreenModal'}}
      />
    </Stack.Navigator>
  );
}
```

## `package.json`

```json
{
  "name": "whatsappstatussaver",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "expo start --dev-client",
    "android": "expo run:android",
    "clean": "cd android && ./gradlew clean",
    "lint": "eslint ."
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "^1.23.1",
    "@react-native-camera-roll/camera-roll": "^7.8.3",
    "@react-navigation/bottom-tabs": "^6.6.1",
    "@react-navigation/native": "^6.1.18",
    "@react-navigation/native-stack": "^6.11.0",
    "expo": "~51.0.0",
    "expo-dev-client": "~4.0.0",
    "react": "18.2.0",
    "react-native": "0.74.5",
    "react-native-gesture-handler": "^2.18.1",
    "react-native-safe-area-context": "^4.10.9",
    "react-native-saf-x": "^2.2.3",
    "react-native-screens": "^3.34.0",
    "react-native-video": "^6.4.5",
    "zustand": "^4.5.5"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@babel/preset-env": "^7.20.0",
    "@babel/runtime": "^7.20.0"
  }
}
```

## `eas.json`

```json
{
  "cli": {
    "version": ">= 10.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

## `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!--
      Storage strategy: SAF (Storage Access Framework) for reading the WhatsApp
      .Statuses folder. SAF needs NO manifest permission — access is granted at
      runtime via a persisted folder URI. We deliberately do NOT request
      MANAGE_EXTERNAL_STORAGE ("All files access"), which Google Play rejects for
      non-file-manager apps.

      The READ_MEDIA_* / READ_EXTERNAL_STORAGE entries below are only for saving
      copies into the public gallery via CameraRoll, scoped by SDK level.
    -->

    <!-- Android <= 12 (API <= 32): legacy read, capped so newer devices ignore it -->
    <uses-permission
        android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />

    <!-- Writing to shared storage only needed on API <= 28 -->
    <uses-permission
        android:name="android.permission.WRITE_EXTERNAL_STORAGE"
        android:maxSdkVersion="28" />

    <!-- Android 13+ (API 33+): granular media permissions for gallery save -->
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />

    <!-- Detect whether WhatsApp / WhatsApp Business is installed (Android 11+ package visibility) -->
    <queries>
        <package android:name="com.whatsapp" />
        <package android:name="com.whatsapp.w4b" />
    </queries>

    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/AppTheme"
        android:requestLegacyExternalStorage="true">

        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

## `babel.config.js`

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

## `metro.config.js`

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
```

## `index.js`

```javascript
import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
```

## `.gitignore`

```gitignore
node_modules/
.expo/
dist/
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/

# macOS
.DS_Store

# Android
android/app/build/
android/build/
.gradle/
*.iml
.idea/
```

