import {useEffect, useRef, useCallback} from 'react';
import {useRewardedAd as useAdMobRewardedAd} from 'react-native-google-mobile-ads';
import {REWARDED_AD_UNIT_ID} from '../utils/ads';

/**
 * Hook that pre-loads a RewardedAd and exposes a `showAd(onComplete)` function.
 *
 * - If ad is ready: plays the ad and invokes `onComplete` when reward is earned or ad closes.
 * - If ad is not ready: immediately invokes `onComplete` so UX is never blocked.
 * - Automatically reloads the next ad once the current one is closed.
 */
export function useRewardedAd() {
  const {isLoaded, isClosed, isEarnedReward, load, show, error} =
    useAdMobRewardedAd(REWARDED_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: false,
    });

  const pendingCbRef = useRef(null);

  // Pre-load on mount
  useEffect(() => {
    try {
      load();
    } catch (e) {
      console.log('Error loading rewarded ad:', e);
    }
  }, [load]);

  // If an error happens while a callback was pending, run it so user isn't stuck
  useEffect(() => {
    if (error && pendingCbRef.current) {
      const cb = pendingCbRef.current;
      pendingCbRef.current = null;
      cb();
    }
  }, [error]);

  // When ad finishes & closes, run pending callback and preload next ad
  useEffect(() => {
    if (isClosed) {
      if (pendingCbRef.current) {
        const cb = pendingCbRef.current;
        pendingCbRef.current = null;
        setTimeout(() => {
          try {
            cb();
          } catch (e) {
            console.log('Error in ad completion callback:', e);
          }
        }, 250);
      }
      try {
        load();
      } catch (e) {
        console.log('Error reloading rewarded ad:', e);
      }
    }
  }, [isClosed, load]);

  const showAd = useCallback(
    onEarned => {
      pendingCbRef.current = onEarned;
      if (isLoaded) {
        try {
          show();
        } catch (err) {
          console.log('Error showing rewarded ad:', err);
          if (pendingCbRef.current) {
            const cb = pendingCbRef.current;
            pendingCbRef.current = null;
            cb();
          }
        }
      } else {
        // Ad not ready yet — don't block user action, execute immediately
        try {
          load();
        } catch (_e) {}
        if (pendingCbRef.current) {
          const cb = pendingCbRef.current;
          pendingCbRef.current = null;
          cb();
        }
      }
    },
    [isLoaded, show, load],
  );

  return {showAd, adLoaded: isLoaded, error};
}
