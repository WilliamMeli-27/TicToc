// RootNavigator.tsx — remplace les imports directs par des imports lazy
import React, { lazy, Suspense } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import BottomTabNavigator from './BottomTabNavigator';

// Import lazy — Agora ne se charge QUE quand l'écran est ouvert
const LiveListScreen = lazy(() => import('../screens/LiveListScreen'));
const LiveHostScreen = lazy(() => import('../screens/LiveHostScreen'));
const LiveViewerScreen = lazy(() => import('../screens/LiveViewerScreen'));
const LiveStartScreen = lazy(() => import('../screens/LiveStartScreen'));

const Stack = createStackNavigator<RootStackParamList>();

const Fallback = () => (
  <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator color="#FE2C55" size="large" />
  </View>
);

const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) return <Fallback />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="App" component={BottomTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
      <Stack.Screen name="LiveList">
        {props => <Suspense fallback={<Fallback />}><LiveListScreen {...props} /></Suspense>}
      </Stack.Screen>
      <Stack.Screen name="LiveHost" options={{ headerShown: false }}>
        {props => <Suspense fallback={<Fallback />}><LiveHostScreen {...props} /></Suspense>}
      </Stack.Screen>
      <Stack.Screen name="LiveViewer" options={{ headerShown: false }}>
        {props => <Suspense fallback={<Fallback />}><LiveViewerScreen {...props} /></Suspense>}
      </Stack.Screen>
      <Stack.Screen name="LiveStart" options={{ headerShown: false }}>
        {props => <Suspense fallback={<Fallback />}><LiveStartScreen {...props} /></Suspense>}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default RootNavigator;