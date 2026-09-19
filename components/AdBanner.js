import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import {BANNER_AD_UNIT_ID} from '../utils/ads';

/**
 * Thin wrapper around Google Mobile Ads BannerAd.
 *
 * Placed above the bottom tab bar. Renders standard BANNER (320x50)
 * using the provided test ID: ca-app-pub-3940256099942544/6300978111.
 */
export default function AdBanner() {
  const [adLoaded, setAdLoaded] = useState(false);

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('Banner ad loaded successfully');
          setAdLoaded(true);
        }}
        onAdFailedToLoad={error => {
          console.log('Banner ad failed to load:', error);
          setAdLoaded(false);
        }}
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
