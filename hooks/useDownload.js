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
