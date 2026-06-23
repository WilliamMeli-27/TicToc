import React from 'react';
import { createBottomTabNavigator, BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomTabParamList } from './types';

// Écrans temporaires (on les remplacera phase par phase)
import FeedScreen from '../screens/FeedScreen';
import ForYouNavigator from '../navigation/ForYouNavigator';
import UploadScreen from '../screens/UploadScreen';
import InboxScreen from '../screens/InboxScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LiveListScreen from '../screens/LiveListScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

// Bouton central "+" personnalisé
const UploadButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.uploadBtn}>
    <View style={styles.uploadBtnInner}>
      <Text style={styles.uploadBtnText}>+</Text>
    </View>
  </TouchableOpacity>
);

// Composants de rendu d'icônes et boutons (définis en dehors du render pour éviter react/no-unstable-nested-components)
const HomeIcon = ({ color }: { color: string }) => (
  <Text style={[styles.tabIcon, { color }]}>⊞</Text>
);
const ForYouIcon = ({ color }: { color: string }) => (
  <Text style={[styles.tabIcon, { color }]}>◉</Text>
);
const InboxIcon = ({ color }: { color: string }) => (
  <Text style={[styles.tabIcon, { color }]}>✉</Text>
);
const ProfileIcon = ({ color }: { color: string }) => (
  <Text style={[styles.tabIcon, { color }]}>◎</Text>
);
const LiveIcon = ({ color }: { color: string }) => (
  <Text style={[styles.tabIcon, { color }]}>📡</Text>
);

const UploadTabButton = (props: BottomTabBarButtonProps) => (
  <UploadButton onPress={props.onPress as () => void} />
);

const BottomTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: '#FFFFFF',
      tabBarInactiveTintColor: '#888888',
      tabBarShowLabel: true,
      tabBarLabelStyle: styles.tabLabel,
    }}>
    <Tab.Screen
      name="HomeTab"
      component={FeedScreen}
      options={{
        tabBarLabel: 'Accueil',
        tabBarIcon: HomeIcon,
      }}
    />
    <Tab.Screen
      name="ForYouTab"
      component={ForYouNavigator}
      options={{
        tabBarLabel: 'Pour toi',
        tabBarIcon: ForYouIcon,
      }}
    />
    <Tab.Screen
      name="UploadTab"
      component={UploadScreen}
      options={{
        tabBarLabel: '',
        tabBarButton: UploadTabButton,
      }}
    />
    <Tab.Screen
      name="InboxTab"
      component={InboxScreen}
      options={{
        tabBarLabel: 'Inbox',
        tabBarIcon: InboxIcon,
      }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profil',
        tabBarIcon: ProfileIcon,
      }}
    />
    <Tab.Screen
      name="LiveTab"
      component={LiveListScreen}
      options={{
        tabBarLabel: 'Lives',
        tabBarIcon: LiveIcon,
      }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#000000',
    borderTopWidth: 0,
    height: 60,
    paddingBottom: 8,
  },
  tabLabel: {
    fontSize: 11,
  },
  tabIcon: {
    fontSize: 22,
  },
  uploadBtn: {
    top: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBtnInner: {
    width: 46,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FE2C55',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderLeftColor: '#25F4EE',
    borderRightColor: '#FE2C55',
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 26,
  },
});

export default BottomTabNavigator;