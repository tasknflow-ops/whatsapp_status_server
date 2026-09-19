import {useCallback, useState} from 'react';
import {Alert} from 'react-native';
import {saveToGallery} from '../native/storage';
import {useRewardedAd} from './useRewardedAd';

/**
 * Handles saving a status file to the gallery.
 *
 * Plays a Rewarded Ad when the user taps save. If the ad is not ready,
 * it saves immediately so the user experience is never blocked.
 *
 * Returns: { save, savingUri }
 *   save(file)  -> Promise<boolean>
 *   savingUri   -> uri of the item currently saving, or null
 */
export function useDownload() {
  const [savingUri, setSavingUri] = useState(null);
  const {showAd} = useRewardedAd();

  const save = useCallback(
    async file => {
      if (!file?.uri) return false;

      return new Promise(resolve => {
        showAd(async () => {
          setSavingUri(file.uri);
          try {
            const ok = await saveToGallery(file);
            if (ok) {
              Alert.alert('Saved', 'Status saved to your gallery.');
            } else {
              Alert.alert('Could not save', 'Something went wrong saving this file.');
            }
            resolve(ok);
          } catch (_e) {
            Alert.alert('Could not save', 'Something went wrong saving this file.');
            resolve(false);
          } finally {
            setSavingUri(null);
          }
        });
      });
    },
    [showAd],
  );

  return {save, savingUri};
}
