// src/navigation/ForYouNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ForYouStackParamList } from './types';
import ForYouScreen from '../screens/ForYouScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';

const Stack = createStackNavigator<ForYouStackParamList>();

const ForYouNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Discover" component={ForYouScreen} />
    <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
  </Stack.Navigator>
);

export default ForYouNavigator;