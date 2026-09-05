import React, {useEffect} from 'react';
import {View, ActivityIndicator, StyleSheet, StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import AppNavigator from './navigation/AppNavigator';
import PermissionGate from './components/PermissionGate';
import {useSafPermission} from './hooks/useSafPermission';
import {useAppStore} from './store/useAppStore';
import {colors} from './utils/theme';

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
