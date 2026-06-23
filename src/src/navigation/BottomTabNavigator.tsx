import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomTabParamList } from './types';

// Écrans temporaires (on les remplacera phase par phase)
import FeedScreen from '../screens/FeedScreen';
import ForYouNavigator from '../navigation/ForYouNavigator';
import UploadScreen from '../screens/UploadScreen';
import InboxScreen from '../screens/InboxScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

// Bouton central "+" personnalisé
const UploadButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.uploadBtn}>
    <View style={styles.uploadBtnInner}>
      <Text style={styles.uploadBtnText}>+</Text>
    </View>
  </TouchableOpacity>
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
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>⊞</Text>,
      }}
    />
    <Tab.Screen
      name="ForYouTab"
      component={ForYouNavigator}
      options={{
        tabBarLabel: 'Pour toi',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>◉</Text>,
      }}
    />
    <Tab.Screen
      name="UploadTab"
      component={UploadScreen}
      options={{
        tabBarLabel: '',
        tabBarButton: (props) => (
          <UploadButton onPress={props.onPress as () => void} />
        ),
      }}
    />
    <Tab.Screen
      name="InboxTab"
      component={InboxScreen}
      options={{
        tabBarLabel: 'Inbox',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>✉</Text>,
      }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profil',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>◎</Text>,
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