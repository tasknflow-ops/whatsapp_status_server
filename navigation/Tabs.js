import React from 'react';
import {Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ImagesScreen from '../screens/Images/ImagesScreen';
import VideosScreen from '../screens/Videos/VideosScreen';
import SavedScreen from '../screens/Saved/SavedScreen';
import {colors} from '../utils/theme';

const Tab = createBottomTabNavigator();

// Emoji icons keep us dependency-free (no vector-icons native setup needed).
function tabIcon(emoji) {
  return ({focused}) => (
    <Text style={{fontSize: 20, opacity: focused ? 1 : 0.5}}>{emoji}</Text>
  );
}

export default function Tabs() {
  return (
    <Tab.Navigator
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
