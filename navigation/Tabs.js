import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ImagesScreen from '../screens/Images/ImagesScreen';
import VideosScreen from '../screens/Videos/VideosScreen';
import SavedScreen from '../screens/Saved/SavedScreen';
import {colors} from '../utils/theme';
import AdBanner from '../components/AdBanner';

const Tab = createBottomTabNavigator();

// Emoji icons keep us dependency-free (no vector-icons native setup needed).
function tabIcon(emoji) {
  return ({focused}) => (
    <Text style={{fontSize: 20, opacity: focused ? 1 : 0.5}}>{emoji}</Text>
  );
}

/**
 * Renders the three main tabs with a Banner ad sitting between the screen
 * content and the tab bar.
 *
 * We use `tabBar` prop to inject a custom tab bar that wraps the default
 * BottomTabBar with the AdBanner on top of it.
 */
import {BottomTabBar} from '@react-navigation/bottom-tabs';

function TabBarWithAd(props) {
  return (
    <View style={styles.tabBarWrapper}>
      <AdBanner />
      <BottomTabBar {...props} />
    </View>
  );
}

export default function Tabs() {
  return (
    <Tab.Navigator
      tabBar={props => <TabBarWithAd {...props} />}
      screenOptions={{
        headerStyle: {backgroundColor: colors.primary},
        headerTintColor: colors.white,
        headerTitleStyle: {fontWeight: '700'},
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {backgroundColor: colors.surface, height: 58, paddingBottom: 6},
      }}>
      <Tab.Screen
        name="Images"
        component={ImagesScreen}
        options={{title: 'Images', tabBarIcon: tabIcon('🖼️')}}
      />
      <Tab.Screen
        name="Videos"
        component={VideosScreen}
        options={{title: 'Videos', tabBarIcon: tabIcon('🎬')}}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{title: 'Saved', tabBarIcon: tabIcon('💾')}}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    backgroundColor: colors.surface,
  },
});
