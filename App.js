import React, {useEffect} from 'react';
import {View, ActivityIndicator, StyleSheet, StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import mobileAds from 'react-native-google-mobile-ads';

import AppNavigator from './navigation/AppNavigator';
import PermissionGate from './components/PermissionGate';
import FirstLaunchDisclaimerModal from './components/FirstLaunchDisclaimerModal';
import OnboardingScreen from './screens/Onboarding/OnboardingScreen';
import {useSafPermission} from './hooks/useSafPermission';
import {useAppStore} from './store/useAppStore';
import {colors} from './utils/theme';

/**
 * Root component that orchestrates the full first-run flow:
 *
 *   Boot → Disclaimer → Onboarding → Permission/Home
 *
 * Each step is persisted via AsyncStorage so it only ever shows once.
 */
export default function App() {
  const hydrate = useAppStore(s => s.hydrate);
  const hydrated = useAppStore(s => s.hydrated);
  const hasAcceptedDisclaimer = useAppStore(s => s.hasAcceptedDisclaimer);
  const setHasAcceptedDisclaimer = useAppStore(s => s.setHasAcceptedDisclaimer);
  const hasSeenOnboarding = useAppStore(s => s.hasSeenOnboarding);
  const setHasSeenOnboarding = useAppStore(s => s.setHasSeenOnboarding);
  const {isGranted, checking, requestAccess} = useSafPermission();

  // Load all persisted state and initialize AdMob on boot.
  useEffect(() => {
    hydrate();
    mobileAds()
      .initialize()
      .then(statuses => {
        console.log('Google Mobile Ads initialized:', statuses);
      })
      .catch(err => {
        console.warn('Google Mobile Ads init warning:', err);
      });
  }, [hydrate]);

  const booting = !hydrated || checking;

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.tealDark} />

        {/* ── 1. Loading splash ── */}
        {booting ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.teal} />
          </View>

        /* ── 2. Onboarding (shown after disclaimer, before permission) ── */
        ) : hasAcceptedDisclaimer && !hasSeenOnboarding ? (
          <OnboardingScreen onFinish={() => setHasSeenOnboarding(true)} />

        /* ── 3. Main app or permission gate ── */
        ) : hasAcceptedDisclaimer && hasSeenOnboarding ? (
          isGranted ? (
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          ) : (
            <PermissionGate onGrant={requestAccess} checking={checking} />
          )
        ) : (
          /* Waiting for disclaimer — render PermissionGate behind the modal */
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.teal} />
          </View>
        )}

        {/* ── Disclaimer modal — floats above everything until accepted ── */}
        <FirstLaunchDisclaimerModal
          visible={!booting && !hasAcceptedDisclaimer}
          onAccept={() => setHasAcceptedDisclaimer(true)}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4FBFC',
  },
});
