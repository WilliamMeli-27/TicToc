import React, { useState, useRef } from 'react';
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
// import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 380;

// Types
interface Post {
  id: string;
  imageUrl: string;
  views: number;
}

interface UserStats {
  followers: number;
  following: number;
  likes: number;
}

type TabType = 'posts' | 'private' | 'saved';

interface ProfileScreenProps {
  onLivePress?: () => void;
  onLogout?: () => void;
  userId?: string;
}

// Mock data
const mockPosts: Post[] = [
  {
    id: '1',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_1GcroSwghugP4bfX-41EOgD7kgoEdkUTWw4zXRbwwrzL8ONPVAY9GDMfqzfVEp-uZLKP2-Y2J6-t7Txck_CF3wKHx-xMRX7jC-rG73Cx0JdjJYD-FwSL2Z-y-NXAM3Wb1dHtlprfh6FEKLzWWlaELYpY9DLZNOOtWxQ618R9uxqncQSKeBdGzmkIpKi0ugvyO8h2AAqAseUr9w697KgIia0n6f8Di07tugvZ1fUrKgf4n5KKtN6SBZRKQCcSMt3vxj4KPBwiaGvY',
    views: 1200000,
  },
  {
    id: '2',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnziUdYtRvIjeGd6x6SJnSwPBMgwJAgmP15-wjHJbXoI0ciRx-LeJpDVscw636jgPNuSz8B31tUB2eO7v_ZGMq8Q7HNsBzBTDrjvXhYlASLZQGnaztXT-musbTvfS1jGG0k9v2e_mMS0EyWXkX1MTWLIVioZchIIjQsBYhrfAcCi5ytOJzdQNozaqxoioM4w7YVVb_2t6tN3ZMBaHecLTTB0AxHSsdpA9qaTSudcYsJAYpQXmAivCM52tSQ0d_7oRDJr5KQdKHRNKi',
    views: 856000,
  },
  {
    id: '3',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7osO5RMsbsADYcmlHKtPi62KjrpBIvOOapmHndRhFnPjGdUyyjljgxbhDf6yQGwVoUvYowYOTikuqvcetecQXVhUC5qXOBjN88o2c51kb89xThvWY5_yCXkbC1iZz4lYh07NG0gyIalTu1sd3m5jiJP5peHHXmlX8ZcZ4T7nL0lnV4PlSK6g2dH8d4Yg3kRiatlokfEgNjZg9g-al_IRViNd-3emKBItFty8IB3EPEDGTVpoEfS8hOLGdwLSV2AU48KY6sDHowFID',
    views: 2400000,
  },
  {
    id: '4',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlcbgTCUabWIg-bxsHfMkExEH6a_ho-1yK2C9LB8_ejWI5cjo6wl1yCUNL2YvhMFmm2-MDhXr-5ha5IGsXZiynLp9_nSPTVJBZB0ocu_lcpr3d68Jo6h74iZD60hs0Y1JzqzsxQgpQwEVXoCSnx0ws4H-9ELfQEAw-Y2dPNGL5jE3IvcXrfGbLuAUd4m1pBux3c9kVvfywUwKRQuIrV1E3WdjWutc2BlnA4goYPJh3hMnEiy5Uc7Y2jU1gZgmE36zynbZcS8UVbweV',
    views: 92000,
  },
  {
    id: '5',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDyy6JNdRX2dXfWvM1PlauFcHBihZ06VFDnx951uUUVYpIr-vrOiiT5cSlox7buC2QNF8gh9ekwIyNrZiuXhDZs3qDq9sPKAHp1SsH0Tz5znO6Z-T2qhZVcxKKnLW_ia4R_EMwvMPEgmGYwV95AHuvzkKjmKYYLgmz2jVqb8rJaCXFiJ8hu6Xjou76gr3OyseUDRXsbc4pHcnj9BXp10qxqsxtrw0YPWg_1j5ZKImTtO-bfEY__BFA-j9otEX2EKVcJCBSioEHHzP_',
    views: 310000,
  },
  {
    id: '6',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3z3JwsJWlj4we2lGlaFPqUU-Wu01dzXqPJyIQSmQEIz9HJa0SaTIYLj8y3JYK88vF7TISNP9IGIlfPR_blgSRn5XgibyUW_EqW60t8wPesMtj2rMH63HeD8DbQmL6UL1013du6ukw_gYTKj30-pScPr34XULd4fLM9KTeWXrPo45KCLxRtyx2a9Mg30keT69CNehkoZQI9PkOZF97YdSrBFei713KSj3fQyeqrdc8e6sJo5VdE1cDXL7RKGQOhmIi8UKA4tDFl8Ql',
    views: 1100000,
  },
];

const mockPrivatePosts: Post[] = [
  {
    id: 'p1',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_1GcroSwghugP4bfX-41EOgD7kgoEdkUTWw4zXRbwwrzL8ONPVAY9GDMfqzfVEp-uZLKP2-Y2J6-t7Txck_CF3wKHx-xMRX7jC-rG73Cx0JdjJYD-FwSL2Z-y-NXAM3Wb1dHtlprfh6FEKLzWWlaELYpY9DLZNOOtWxQ618R9uxqncQSKeBdGzmkIpKi0ugvyO8h2AAqAseUr9w697KgIia0n6f8Di07tugvZ1fUrKgf4n5KKtN6SBZRKQCcSMt3vxj4KPBwiaGvY',
    views: 45000,
  },
];

const mockSavedPosts: Post[] = [
  {
    id: 's1',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnziUdYtRvIjeGd6x6SJnSwPBMgwJAgmP15-wjHJbXoI0ciRx-LeJpDVscw636jgPNuSz8B31tUB2eO7v_ZGMq8Q7HNsBzBTDrjvXhYlASLZQGnaztXT-musbTvfS1jGG0k9v2e_mMS0EyWXkX1MTWLIVioZchIIjQsBYhrfAcCi5ytOJzdQNozaqxoioM4w7YVVb_2t6tN3ZMBaHecLTTB0AxHSsdpA9qaTSudcYsJAYpQXmAivCM52tSQ0d_7oRDJr5KQdKHRNKi',
    views: 23000,
  },
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLivePress, onLogout, userId: _userId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [stats] = useState<UserStats>({
    followers: 12800,
    following: 482,
    likes: 1200000,
  });
  const [isFollowing, setIsFollowing] = useState(false);
  
  const _scrollY = useRef(new Animated.Value(0)).current;
  const _headerOpacity = useRef(new Animated.Value(1)).current;

  // Format number with K/M
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Get current posts based on active tab
  const getCurrentPosts = (): Post[] => {
    switch (activeTab) {
      case 'posts':
        return mockPosts;
      case 'private':
        return mockPrivatePosts;
      case 'saved':
        return mockSavedPosts;
      default:
        return mockPosts;
    }
  };

  // Handle tab switch
  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Handle edit profile
  const handleEditProfile = () => {
    console.log('Edit profile pressed');
  };

  // Handle share profile
  const handleShareProfile = () => {
    console.log('Share profile pressed');
  };

  // Handle bookmark
  const handleBookmark = () => {
    console.log('Bookmark pressed');
  };

  // Handle follow
  const _handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  // Render post item
  const renderPostItem = ({ item }: { item: Post }) => (
    <Pressable style={styles.postItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      <View style={styles.postOverlay}>
        <View style={styles.postViews}>
          <Text style={styles.playIcon}>▶</Text>
          <Text style={styles.viewCount}>{formatNumber(item.views)}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#131313" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerButton}>
          <Text style={styles.headerIcon}>🔍</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable style={styles.headerButton} onPress={onLivePress}>
          <Text style={styles.headerIcon}>📺</Text>
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBorder}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHtUTZaGY__j8Ina02NAFFTc7kqbMIn-OC9xSRiyUm7jShg17lsCNxzV-U5KEYR74G4Z6f3geoYXJ4p15z-QqQD87_vMoulc3sEsyohDgGN_Z08Iw_a87doQUoxKDcqBHG4wNm4tzAaLh8jmZNgJrAgMJBlTC8AtDjni9bQIphgkOeH8B3iWbPXQq5up9AcAG0G3EId3yKYvWRf-NG7YZWXIfA7cjcKSVnRqPGkJzjdLj6NUG1POx_Bt86dsqOe2qU2eTsB0HG3d92' }}
                style={styles.avatar}
              />
            </View>
            <Pressable style={styles.addButton}>
              <Text style={styles.addIcon}>+</Text>
            </Pressable>
          </View>

          {/* User Info */}
          <Text style={styles.username}>@digital_nexus</Text>
          <Text style={styles.bio}>
            Creating the future of digital art ⚡️ Visual Architect based in the Grid. Always evolving.
          </Text>

          {/* Stats Bar */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatNumber(stats.followers)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatNumber(stats.following)}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatNumber(stats.likes)}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable style={styles.actionButton} onPress={handleEditProfile}>
              <Text style={styles.actionButtonText}>Edit Profile</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={handleShareProfile}>
              <Text style={styles.actionButtonText}>Share Profile</Text>
            </Pressable>
            <Pressable style={styles.iconButton} onPress={handleBookmark}>
              <Text style={styles.iconButtonIcon}>🔖</Text>
            </Pressable>
            {onLogout && (
              <Pressable style={styles.iconButton} onPress={onLogout}>
                <Text style={styles.iconButtonIcon}>🚪</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <Pressable 
            style={[styles.tabItem, activeTab === 'posts' && styles.activeTab]}
            onPress={() => handleTabPress('posts')}
          >
            <Text style={[styles.tabIcon, activeTab === 'posts' && styles.activeTabText]}>⊞</Text>
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>Posts</Text>
          </Pressable>
          <Pressable 
            style={[styles.tabItem, activeTab === 'private' && styles.activeTab]}
            onPress={() => handleTabPress('private')}
          >
            <Text style={[styles.tabIcon, activeTab === 'private' && styles.activeTabText]}>🔒</Text>
            <Text style={[styles.tabText, activeTab === 'private' && styles.activeTabText]}>Private</Text>
          </Pressable>
          <Pressable 
            style={[styles.tabItem, activeTab === 'saved' && styles.activeTab]}
            onPress={() => handleTabPress('saved')}
          >
            <Text style={[styles.tabIcon, activeTab === 'saved' && styles.activeTabText]}>❤️</Text>
            <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>Saved</Text>
          </Pressable>
        </View>

        {/* Content Grid */}
        <FlatList
          data={getCurrentPosts()}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          scrollEnabled={false}
          contentContainerStyle={styles.gridContainer}
        />
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 20,
    color: '#e2e2e2',
  },
  headerTitle: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: '800',
    letterSpacing: -0.02,
    color: '#00f0ff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  avatarBorder: {
    width: 112,
    height: 112,
    borderRadius: 56,
    padding: 4,
    backgroundColor: '#00f0ff',
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 52,
  },
  addButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00f0ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#131313',
  },
  addIcon: {
    fontSize: 16,
    color: '#00363a',
    fontWeight: 'bold',
  },
  username: {
    fontSize: isSmallScreen ? 28 : 32,
    fontWeight: '700',
    lineHeight: isSmallScreen ? 36 : 40,
    letterSpacing: -0.02,
    color: '#e2e2e2',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(185, 202, 203, 0.8)',
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statValue: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.01,
    color: '#00f0ff',
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: 'rgba(185, 202, 203, 0.6)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#e2e2e2',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonIcon: {
    fontSize: 20,
    color: '#e2e2e2',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#00f0ff',
  },
  tabIcon: {
    fontSize: 20,
    color: 'rgba(185, 202, 203, 0.6)',
  },
  tabText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: 'rgba(185, 202, 203, 0.6)',
  },
  activeTabText: {
    color: '#00f0ff',
  },
  gridContainer: {
    paddingHorizontal: 2,
  },
  postItem: {
    flex: 1,
    aspectRatio: 9 / 16,
    margin: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  postViews: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playIcon: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  viewCount: {
    fontSize: 10,
    lineHeight: 16,
    color: 'rgba(255, 255, 255, 0.9)',
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
});

export default ProfileScreen;