import React from 'react';
import {View, StyleSheet} from 'react-native';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
import {BANNER_AD_UNIT_ID} from '../utils/ads';

/**
 * Thin wrapper around Google Mobile Ads BannerAd.
 *
 * Place this just above the bottom tab bar. It renders a standard
 * BANNER (320×50) and collapses to nothing if the ad fails to load,
 * so it never shows an ugly empty box.
 */
export default function AdBanner() {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.BANNER}
        requestOptions={{requestNonPersonalizedAdsOnly: false}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
