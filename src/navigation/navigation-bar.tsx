// components/BottomNavigationBar.tsx (version complète)
// components/BottomNavigationBar.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';

// Types
export type TabType = 'home' | 'discover' | 'create' | 'inbox' | 'profile';

export interface BottomNavigationBarProps {
  activeTab: TabType;
  onTabPress: (tab: TabType) => void;
  showCreateButton?: boolean;
  inboxBadgeCount?: number;
  customStyles?: {
    container?: object;
    navItem?: object;
    navIcon?: object;
    navIconActive?: object;
    navIconCreate?: object;
    badgeContainer?: object;
    badgeText?: object;
  };
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  activeTab,
  onTabPress,
  showCreateButton = true,
  inboxBadgeCount = 0,
  customStyles = {},
}) => {
  const formatBadgeCount = (count: number): string => {
    if (count > 99) return '99+';
    return count.toString();
  };

  const tabs: { key: TabType; icon: string; label: string }[] = [
    { key: 'home', icon: '🏠', label: 'Home' },
    { key: 'discover', icon: '🔍', label: 'Discover' },
    { key: 'create', icon: '➕', label: 'Create' },
    { key: 'inbox', icon: '📥', label: 'Inbox' },
    { key: 'profile', icon: '👤', label: 'Profile' },
  ];

  const renderTab = (tab: typeof tabs[0]) => {
    const isActive = activeTab === tab.key;
    const isCreateTab = tab.key === 'create';
    
    // Skip create tab if not shown
    if (isCreateTab && !showCreateButton) return null;
    
    return (
      <Pressable
        key={tab.key}
        style={({ pressed }) => [
          styles.navItem,
          customStyles.navItem,
          pressed && styles.navItemPressed,
        ]}
        onPress={() => onTabPress(tab.key)}
        android_ripple={{ color: 'rgba(255,255,255,0.12)', borderless: true }}
      >
        <View>
          <Text
            style={[
              styles.navIcon,
              isCreateTab && styles.navIconCreate,
              isActive && !isCreateTab && styles.navIconActive,
              customStyles.navIcon,
              isActive && !isCreateTab && customStyles.navIconActive,
              isCreateTab && customStyles.navIconCreate,
            ]}
          >
            {tab.icon}
          </Text>
          {tab.key === 'inbox' && inboxBadgeCount > 0 && (
            <View style={[styles.badgeContainer, customStyles.badgeContainer]}>
              <Text style={[styles.badgeText, customStyles.badgeText]}>
                {formatBadgeCount(inboxBadgeCount)}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.bottomNav, customStyles.container]}>
      {tabs.map(renderTab)}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 24,
    left: '5%',
    right: '5%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    backgroundColor: 'rgba(19, 19, 19, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    zIndex: 50,
    shadowColor: 'rgba(0, 240, 255, 0.2)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 5,
  },
  navItemPressed: {
    opacity: 0.7,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 28,
    color: 'rgba(185, 202, 203, 0.6)',
  },
  navIconActive: {
    color: '#00f0ff',
    textShadowColor: 'rgba(0, 219, 233, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  navIconCreate: {
    fontSize: 36,
    color: '#00f0ff',
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -12,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ff4b89',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#66002c',
  },
});

export default BottomNavigationBar;