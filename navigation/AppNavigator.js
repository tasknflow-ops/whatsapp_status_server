import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Tabs from './Tabs';
import PreviewScreen from '../screens/Preview/PreviewScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tabs" component={Tabs} options={{headerShown: false}} />
      <Stack.Screen
        name="Preview"
        component={PreviewScreen}
        options={{headerShown: false, presentation: 'fullScreenModal'}}
      />
    </Stack.Navigator>
  );
}
