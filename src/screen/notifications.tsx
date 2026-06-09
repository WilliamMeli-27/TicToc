import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
  Image,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { Notification, FilterType, filters, mockNotifications } from '../components/NotificationItems';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 380;

export const InboxScreen: React.FC<{ onLivePress?: () => void }> = ({ onLivePress }) => {
  const [activeFilter, setActiveFilter] = useState<string>('likes');
  const [notifications] = useState<Notification[]>(mockNotifications);
  const [isFollowing, setIsFollowing] = useState<{ [key: string]: boolean }>({});

  // Format number with K/M
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Handle follow button press
  const handleFollow = (userId: string) => {
    setIsFollowing(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Handle notification press
  const handleNotificationPress = (notification: Notification) => {
    console.log('Notification pressed:', notification.id);
  };

  // Render filter item
  const renderFilterItem = ({ item }: { item: FilterType }) => {
    const isActive = activeFilter === item.id;
    
    return (
      <Pressable
        style={styles.filterItem}
        onPress={() => setActiveFilter(item.id)}

      >
        <View style={[
          styles.filterIconContainer,
          isActive && styles.filterIconContainerActive,
          isActive && { borderColor: item.activeColor, shadowColor: item.activeColor }
        ]}>
          <Text style={styles.filterIcon}>{item.icon}</Text>
        </View>
        <Text style={[
          styles.filterLabel,
          isActive && styles.filterLabelActive
        ]}>
          {item.label}
        </Text>
      </Pressable>
    );
  };

  // Render notification item
  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const getTypeIcon = () => {
      switch (item.type) {
        case 'like': return '❤️';
        case 'follow': return '👤';
        case 'comment': return '💬';
        case 'mention': return '@';
        case 'system': return '✨';
        default: return '📢';
      }
    };

    const getTypeColor = () => {
      switch (item.type) {
        case 'like': return '#ffb1c3';
        case 'follow': return '#a2ef00';
        case 'comment': return '#00f0ff';
        case 'mention': return '#7df4ff';
        case 'system': return '#ff4b89';
        default: return '#e2e2e2';
      }
    };

    return (
      <Pressable
        style={styles.notificationItem}
        onPress={() => handleNotificationPress(item)}

      >
        {/* Avatar Section */}
        <View style={styles.notificationAvatar}>
          {item.userAvatar ? (
            <Image source={{ uri: item.userAvatar }} style={styles.avatarImage} />
          ) : item.type === 'system' ? (
            <View style={[styles.systemAvatar, { backgroundColor: `${getTypeColor()}20` }]}>
              <Text style={styles.systemIcon}>{getTypeIcon()}</Text>
            </View>
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.defaultAvatarText}>{item.username?.[0] || 'U'}</Text>
            </View>
          )}
          
          {/* Type Badge */}
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor() }]}>
            <Text style={styles.typeIcon}>{getTypeIcon()}</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.notificationContent}>
          <Text style={styles.notificationText}>
            {item.username && <Text style={styles.username}>{item.username}</Text>}
            {item.userCount && (
              <Text style={styles.username}>
                {' '}and {item.userCount} others{' '}
              </Text>
            )}
            <Text style={styles.notificationMessage}>
              {item.content}
            </Text>
            <Text style={styles.timestamp}> {item.timestamp}</Text>
          </Text>
        </View>

        {/* Action / Thumbnail Section */}
        {item.type === 'follow' && item.username && (
          <Pressable
            style={[
              styles.followButton,
              isFollowing[item.username] && styles.followingButton
            ]}
            onPress={() => handleFollow(item.username!)}
          >
            <Text style={[
              styles.followButtonText,
              isFollowing[item.username] && styles.followingButtonText
            ]}>
              {isFollowing[item.username] ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
        )}

        {item.thumbnail && (
          <View style={styles.thumbnailContainer}>
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          </View>
        )}

        {item.type === 'system' && (
          <Text style={styles.chevronIcon}>→</Text>
        )}
      </Pressable>
    );
  };

  // Group notifications by date
  const todayNotifications = notifications.filter(n => 
    n.timestamp === '2h' || n.timestamp === '5h' || n.timestamp === '8h'
  );
  const weekNotifications = notifications.filter(n => 
    n.timestamp === '2d' || n.timestamp === '4d' || n.timestamp === '6d'
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#131313" />
      
      {/* Background Effect */}
      <View style={styles.backgroundEffects}>
        <View style={styles.bgBlobTop} />
        <View style={styles.bgBlobBottom} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.searchIcon}>🔍</Text>
        </View>
        <Text style={styles.headerTitle}>Inbox</Text>
        <View style={styles.headerRight}>
          <Pressable onPress={onLivePress}>
            <Text style={styles.liveIcon}>📺</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Filters */}
        <FlatList
          data={filters}
          renderItem={renderFilterItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        />

        {/* Today Section */}
        {todayNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today</Text>
            {todayNotifications.map((item) => (
              <View key={item.id}>
                {renderNotificationItem({ item })}
              </View>
            ))}
          </View>
        )}

        {/* This Week Section */}
        {weekNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Week</Text>
            {weekNotifications.map((item) => (
              <View key={item.id}>
                {renderNotificationItem({ item })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
  },
  backgroundEffects: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: -1,
  },
  bgBlobTop: {
    position: 'absolute',
    top: '-10%',
    right: '-10%',
    width: '50%',
    height: '50%',
    borderRadius: 999,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  bgBlobBottom: {
    position: 'absolute',
    bottom: '-10%',
    left: '-10%',
    width: '50%',
    height: '50%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 177, 195, 0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
  },
  headerLeft: {
    width: 40,
  },
  searchIcon: {
    fontSize: 24,
    color: '#00f0ff',
  },
  headerTitle: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: '800',
    letterSpacing: -0.02,
    color: '#00f0ff',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  liveIcon: {
    fontSize: 24,
    color: '#00f0ff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  filterItem: {
    alignItems: 'center',
    gap: 8,
  },
  filterIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(19, 19, 19, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIconContainerActive: {
    borderWidth: 2,
    borderColor: '#ffb1c3',
  },
  filterIcon: {
    fontSize: 24,
  },
  filterLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: 'rgba(185, 202, 203, 0.6)',
  },
  filterLabelActive: {
    color: '#e2e2e2',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.01,
    color: 'rgba(185, 202, 203, 0.4)',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  notificationAvatar: {
    position: 'relative',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  defaultAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultAvatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#e2e2e2',
  },
  systemAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemIcon: {
    fontSize: 28,
  },
  typeBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#131313',
  },
  typeIcon: {
    fontSize: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#e2e2e2',
  },
  username: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    color: '#e2e2e2',
  },
  timestamp: {
    color: 'rgba(185, 202, 203, 0.6)',
    marginLeft: 4,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#00f0ff',
    borderRadius: 999,
  },
  followingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  followButtonText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#00363a',
  },
  followingButtonText: {
    color: '#e2e2e2',
  },
  thumbnailContainer: {
    width: 56,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(19, 19, 19, 0.7)',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  chevronIcon: {
    fontSize: 24,
    color: 'rgba(185, 202, 203, 0.4)',
  },
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
  },
  navItem: {
    alignItems: 'center',
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
  unreadDot: {
    position: 'absolute',
    top: -4,
    right: -8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4b89',
  },
});

export default InboxScreen;