import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {createBottomTabNavigator, BottomTabBar} from '@react-navigation/bottom-tabs';
import ImagesScreen from '../screens/Images/ImagesScreen';
import VideosScreen from '../screens/Videos/VideosScreen';
import SavedScreen from '../screens/Saved/SavedScreen';
import {colors, shadow} from '../utils/theme';
import AdBanner from '../components/AdBanner';

const Tab = createBottomTabNavigator();

// Tab icon with a soft pill highlight behind the active tab.
function tabIcon(emoji) {
  return ({focused}) => (
    <View style={[styles.iconPill, focused && styles.iconPillActive]}>
      <Text style={[styles.iconEmoji, {opacity: focused ? 1 : 0.55}]}>{emoji}</Text>
    </View>
  );
}

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
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: {fontSize: 11, fontWeight: '700', marginTop: 2},
        tabBarStyle: {
          backgroundColor: colors.surface,
          height: 66,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 0,
          ...shadow.soft,
        },
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
        name="Gallery"
        component={SavedScreen}
        options={{title: 'Gallery', tabBarIcon: tabIcon('📁')}}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {backgroundColor: colors.surface},
  iconPill: {
    width: 44,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {backgroundColor: colors.accentSoft},
  iconEmoji: {fontSize: 19},
});
