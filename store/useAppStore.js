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