import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {BANNER_AD_UNIT_ID} from '../utils/ads';
import {colors, spacing} from '../utils/theme';

/**
 * Google Mobile Ads BannerAd component.
 *
 * Sits above the bottom tab bar. Uses ANCHORED_ADAPTIVE_BANNER for
 * full-width responsive display, with automatic fallback to standard BANNER.
 */
export default function AdBanner() {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adSize, setAdSize] = useState(BannerAdSize.ANCHORED_ADAPTIVE_BANNER);

  return (
    <View style={[styles.container, adLoaded && styles.containerLoaded]}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={adSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded successfully with size:', adSize);
          setAdLoaded(true);
        }}
        onAdFailedToLoad={error => {
          console.log('Banner ad failed to load with size:', adSize, error);
          if (adSize === BannerAdSize.ANCHORED_ADAPTIVE_BANNER) {
            setAdSize(BannerAdSize.BANNER);
          } else {
            setAdLoaded(false);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  containerLoaded: {
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    minHeight: 65,
  },
});
