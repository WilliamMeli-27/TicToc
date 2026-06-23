import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import * as userService from '../services/userService';
import * as videoService from '../services/videoService';

const { width, height: _height } = Dimensions.get('window');
const isSmallScreen = width < 380;

export type TabType = 'posts' | 'private' | 'saved';

export interface Post {
  id: string;
  imageUrl: string;
  views: number;
}

interface UserData {
  id: string;
  displayName?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  likesCount?: number;
}

export const DEFAULT_USER_PROFILE = {
  username: '',
  avatar: 'https://picsum.photos/200',
  bio: '',
  stats: {
    followers: 0,
    following: 0,
    likes: 0
  }
};

interface ProfileScreenProps {
  onLivePress?: () => void;
  onLogout?: () => void;
  userId?: string;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLivePress, onLogout, userId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [profile, setProfile] = useState(DEFAULT_USER_PROFILE);
  const [posts, setPosts] = useState<Post[]>([]);
  const [privatePosts, setPrivatePosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [_loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setProfile(DEFAULT_USER_PROFILE);
      setPosts([]);
      setPrivatePosts([]);
      setSavedPosts([]);
      return;
    }
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const uData = (await userService.getUser(userId)) as UserData | null;
        if (uData) {
          setProfile({
            username: uData.displayName || `@${uData.username}`,
            avatar: uData.avatar || 'https://picsum.photos/200',
            bio: uData.bio || 'No bio yet.',
            stats: {
              followers: uData.followersCount || 0,
              following: uData.followingCount || 0,
              likes: uData.likesCount || 0
            }
          });
        }
        
        const userVideos = await videoService.chargerVideosByUser(userId);
        if (userVideos && userVideos.length > 0) {
          const mapped = userVideos.map((v: any) => ({
            id: v.id,
            imageUrl: v.thumbnail || 'https://picsum.photos/200/300',
            views: v.viewsCount || 0
          }));
          setPosts(mapped);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.log('Error loading profile/videos:', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, [userId]);

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
        return posts;
      case 'private':
        return privatePosts;
      case 'saved':
        return savedPosts;
      default:
        return posts;
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
                source={{ uri: profile.avatar }}
                style={styles.avatar}
              />
            </View>
            <Pressable style={styles.addButton}>
              <Text style={styles.addIcon}>+</Text>
            </Pressable>
          </View>

          {/* User Info */}
          <Text style={styles.username}>{profile.username}</Text>
          <Text style={styles.bio}>{profile.bio}</Text>

          {/* Stats Bar */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatNumber(profile.stats.followers)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatNumber(profile.stats.following)}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatNumber(profile.stats.likes)}</Text>
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