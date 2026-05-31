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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 380;

// Types
interface Notification {
  id: string;
  type: 'like' | 'follow' | 'comment' | 'mention' | 'system';
  username?: string;
  userAvatar?: string;
  userCount?: number;
  content?: string;
  timestamp: string;
  thumbnail?: string;
  isRead?: boolean;
}

interface FilterType {
  id: string;
  label: string;
  icon: string;
  activeColor: string;
  activeBgColor: string;
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    username: 'Leo.Studio',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDV4yXKAgZDqOHnT52IsBr1-EJXPjYHMpj5Eq8Mt1jQKqK7Y0kxceeDRal0rOL2km5VZfyuml53zzM7a54Xe-_m5Arq7uYUvgobIBx_PbZb0VZ32eDQFTUn68hi4MI_R7s0Y8nJWP5_siivR4YNV8Ykl2Vj7mx0RzhTP_deGjjO9AZw6hWZjfzRs8K18Z7N3w9wIQjzCJe5FiHAHZWI4MGUkS4H5vCff7cijJ7hCvPdtVYbncPa5yWLr2df3OJnqQKnumB6riOrb7qz',
    content: 'liked your video',
    timestamp: '2h',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXwqDu6gT4Av3GENXFznNinmv8xQDFhzCwyjEhi6TQefWMDyyctR4yz4bKkT3HIa1Z7mOindlwpx9vnUbru7P4KhN_1gBFewHKKzXzTwF91AFn0DFyf8NT9V94jnmJenh_HO3Mwy0o4x0tzpTl3Ua7mY2tFTatjkO7TYx1NsGgNMTxGGPL2zWUOtWI4hXAhdeFHGde7mlwbriUYyZqD_Nk6Foob8jgEoF__K0KJcW1O0AqGzJTKLG3n2OFADY9LIsLvDhGqb8--2I5',
  },
  {
    id: '2',
    type: 'follow',
    username: 'VibeCheck',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCATrOBE5hW87ZmXdIA2It-xaA_C45NUmlLZ3a32X5v7yhmYFL5GHkP6m8Gy_9SncvZVueX80NSzwCNVPzznpqUSi61hbeBa1zZIwwFo5piMvycP5ssd-BeLiUzDTBy-exp33GE00Oc7_Bkew1YDkb8uUkMCbwoLcNbORw1Jp-8GiJDnIRmeO2UPbkZHabm1kFlOdhdH0skl7_9TttT6jeaNcSXN9TQCL_hxHXolzWjTy5Nz5CBC1-h4ljYMcdPsF6uUeBbnXXkNtAU',
    content: 'started following you',
    timestamp: '5h',
  },
  {
    id: '3',
    type: 'comment',
    username: 'Jax_Arts',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDV9rBm0P2cQhI52lJr_8Yn2zd0MtMOp9u0GP8dY1ZkTtLhfxfPo6Gdu0RXQSRtBbkC6YkSyu35Cu_9XLjMHn2Styxzwg-3VJY-MNKKp0DyKfvamHF2qBvE2okjoQs1j5GLs5p7ZGsLMdm__59KSbf7FnNl0x3u6UB1p-13pGyief1RRPjJSxSOwdQQMNlEMBWdfCtZqo4SCy940-g0SlJmnySDtYhdJ7mS6B06jU51UzlIBJQkdzu15pcX0wcAqdQK_barIMbB3Ff8',
    content: 'commented: This is fire! 🔥',
    timestamp: '8h',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYCbBcxKLbHZgAqb13v6v4CfEXSPztD2CkLova2flxxNUqZvm-zc6jF7fEQTlJ6St0JCOiSIOPNxLthdRBBjJAvrfzOl1gnNnZ-wcXiYouXgPqlpDbagMtDvJkLvdJyegyjzn0GwTB_qWvRhSmO5AXjtEr7S6fT75NQTNiQvt0bhX7ND9Rb0y5GG3s8NyvkX7Sir7gElswEhAw7_9UluqS7bSrktccLNP5DRrqMxfMM0nmtjOAa8rycp6qlTW-szQb_195XDSDBsEM',
  },
  {
    id: '4',
    type: 'mention',
    username: 'DigitalPulse',
    content: 'mentioned you in a comment',
    timestamp: '2d',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOots6VE5MKI7LV1V01kcFG4m4qLBmPt7WD0ghfSzwPnPj748PoMBQ4v-xVu32-2zp_THNkI3hgz8kLuZ8ptcsd68SuujyOtMBNDgyi4Di0OKwawLWh9jWFOSgHd20FKPqz4hk59D1YPqry-oFHMGVVGxLbY7bzQlBXkis1k8w-ldZ7axRZhT5mmKvOdl6IzJEcRKxx-TM6fPQUyJM5YGAzVzw5yIeUVCB3xAg8ZL1jKDEJ4RHuMlQyN_JVpJbdjH-fniqmJNltT6k',
  },
  {
    id: '5',
    type: 'like',
    username: 'Sarah_K',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo6OA-AFcSmVrh47fV1_QJ3xfQwRsJQjaMIeJLO7zWafldThLvY3EEvMFGEIzd9vNVxKRX-B1Q_HNgm78w2rSd1mPUccwV1WWzvabx9MDqjUZ71DbgHFZo9uVfqW1DRMzWL2b0S1XlqP4W0dSXnfpQkIswvZweRNnDhfxOKiY6hekWhsn8Pg_AXW2K-e8YQSuE43yvLq-m6anhYwya_9Sn9eNa7WEuFOro43qNYr4gWeCt3WmaP8yPii8HMEJMUqD0UIDonkT75GxN',
    userCount: 12,
    content: 'liked your video',
    timestamp: '4d',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCByvg30eXn0YKmDWV3LNw3DbcE81pVphauwz6hOByxERHKzoNUS30GYNzG3WnqUbw_2ps2LRQ9qsVVImPCVEdo0kRYT0yCjicUddiAxJico1Eb2HVhn32jWtA_zoY3-cD25vW0hGQpE0QTwKqdzJltir1FOl2KD-uD0T01ChoZwg7I2xWK10XKJFt4BygwDblyAwTC7Lk7awl6gaZGwmAmw3VC-KxbsSgWKLcPMyl5XZd-fyPFWVnQ0a_8JO96eOfQChAJydKlO1i6',
  },
  {
    id: '6',
    type: 'system',
    content: 'Your video is trending in #DigitalPulse! Check out the stats.',
    timestamp: '6d',
  },
];

const filters: FilterType[] = [
  { id: 'likes', label: 'Likes', icon: '❤️', activeColor: '#ffb1c3', activeBgColor: '#ffb1c3' },
  { id: 'comments', label: 'Comments', icon: '💬', activeColor: '#00f0ff', activeBgColor: '#00f0ff' },
  { id: 'followers', label: 'Followers', icon: '👤', activeColor: '#a2ef00', activeBgColor: '#a2ef00' },
  { id: 'mentions', label: 'Mentions', icon: '@', activeColor: '#7df4ff', activeBgColor: '#7df4ff' },
];

export const InboxScreen: React.FC<{ onLivePress?: () => void }> = ({ onLivePress }) => {
  const [activeFilter, setActiveFilter] = useState<string>('likes');
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isFollowing, setIsFollowing] = useState<{ [key: string]: boolean }>({});

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;

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