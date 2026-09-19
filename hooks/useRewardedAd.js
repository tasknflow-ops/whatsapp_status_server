import {useEffect, useRef, useCallback} from 'react';
import {RewardedAd, RewardedAdEventType, AdEventType} from 'react-native-google-mobile-ads';
import {REWARDED_AD_UNIT_ID} from '../utils/ads';

/**
 * Hook that pre-loads a RewardedAd and exposes a `showAd(onEarned)` callback.
 *
 * Usage:
 *   const {showAd, adLoaded} = useRewardedAd();
 *   // When user presses "Open":
 *   showAd(() => { /* do the real action *\/ });
 *
 * - If the ad is loaded, it plays the rewarded ad and calls `onEarned` after
 *   the user earns the reward (watches to completion or closes after the reward
 *   threshold, depending on your AdMob unit config).
 * - If the ad is NOT yet loaded, `onEarned` is called immediately so UX is
 *   never blocked.
 * - After the ad closes, a fresh ad is pre-loaded automatically.
 */
export function useRewardedAd() {
  const adRef = useRef(null);
  const loadedRef = useRef(false);
  const pendingCbRef = useRef(null);

  const load = useCallback(() => {
    loadedRef.current = false;

    const rewarded = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: false,
    });

    const unsubEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        if (pendingCbRef.current) {
          pendingCbRef.current();
          pendingCbRef.current = null;
        }
      },
    );

    const unsubClosed = rewarded.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        // If user closed before earning (skipped), still allow action
        if (pendingCbRef.current) {
          pendingCbRef.current();
          pendingCbRef.current = null;
        }
        unsubEarned();
        unsubClosed();
        // Pre-load the next ad
        load();
      },
    );

    const unsubLoaded = rewarded.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
      unsubLoaded();
    });

    rewarded.load();
    adRef.current = rewarded;
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showAd = useCallback(
    (onEarned) => {
      pendingCbRef.current = onEarned;
      if (loadedRef.current && adRef.current) {
        adRef.current.show();
      } else {
        // Ad not ready — don't block user, just run the action
        if (pendingCbRef.current) {
          pendingCbRef.current();
          pendingCbRef.current = null;
        }
      }
    },
    [],
  );

  return {showAd, adLoaded: loadedRef.current};
}
