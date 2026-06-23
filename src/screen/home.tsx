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
  Platform,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import {
  chargerVideos,
} from '../services/videoService';
import { likerVideo, estLike } from '../services/likeService';
import { toggleFollow } from '../services/followService';

const { width, height } = Dimensions.get('window');

export interface VideoPost {
  id: string;
  userId?: string;
  username: string;
  avatar: string;
  videoUrl: string;
  thumbnail: string;
  description: string;
  hashtags: string[];
  musicTitle: string;
  likes: number;
  comments: number;
  bookmarks: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface VideoSlideProps {
  post: VideoPost;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  onShare: (id: string) => void;
  onComment: (id: string) => void;
  onFollow: (username: string) => void;
}

// Video Slide Component
const VideoSlide: React.FC<VideoSlideProps> = ({
  post,
  onLike,
  onBookmark,
  onShare,
  onComment,
  onFollow,
}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const heartScaleAnim = useRef(new Animated.Value(0)).current;

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(post.id);
    
    if (!isLiked) {
      // Heart burst animation
      setShowHeartBurst(true);
      Animated.sequence([
        Animated.spring(heartScaleAnim, {
          toValue: 1.5,
          useNativeDriver: true,
          speed: 50,
        }),
        Animated.spring(heartScaleAnim, {
          toValue: 0,
          useNativeDriver: true,
          speed: 50,
        }),
      ]).start(() => setShowHeartBurst(false));
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark(post.id);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <View style={styles.videoSlide}>
      {/* Background Image/Video */}
      {post.videoUrl ? (
        <Video
          source={{ uri: post.videoUrl }}
          style={styles.backgroundImage}
          resizeMode="cover"
          repeat
          paused={false}
          poster={post.thumbnail}
          posterResizeMode="cover"
        />
      ) : (
        <Image
          source={{ uri: post.thumbnail }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      )}
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradientOverlay}
      />
      
      {/* Heart Burst Animation */}
      {showHeartBurst && (
        <Animated.View
          style={[
            styles.heartBurstContainer,
            { transform: [{ scale: heartScaleAnim }] },
          ]}
        >
          <Text style={styles.heartBurstIcon}>❤️</Text>
        </Animated.View>
      )}
      
      {/* Right Sidebar Interaction Stack */}
      <View style={styles.sidebar}>
        {/* Avatar with Follow Button */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: post.avatar }} style={styles.avatar} />
          <Pressable
            style={styles.followButton}
            onPress={() => onFollow(post.userId || post.username)}
          >
            <Text style={styles.followIcon}>+</Text>
          </Pressable>
        </View>
        
        {/* Like Button */}
        <Pressable style={styles.actionButton} onPress={handleLike}>
          <View style={styles.actionIconContainer}>
            <Text style={[styles.actionIcon, isLiked && styles.actionIconLiked]}>
              {isLiked ? '❤️' : '🤍'}
            </Text>
          </View>
          <Text style={styles.actionCount}>{formatNumber(post.likes)}</Text>
        </Pressable>
        
        {/* Comment Button */}
        <Pressable style={styles.actionButton} onPress={() => onComment(post.id)}>
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>💬</Text>
          </View>
          <Text style={styles.actionCount}>{formatNumber(post.comments)}</Text>
        </Pressable>
        
        {/* Bookmark Button */}
        <Pressable style={styles.actionButton} onPress={handleBookmark}>
          <View style={styles.actionIconContainer}>
            <Text style={[styles.actionIcon, isBookmarked && styles.actionIconBookmarked]}>
              {isBookmarked ? '🔖' : '📑'}
            </Text>
          </View>
          <Text style={styles.actionCount}>{formatNumber(post.bookmarks)}</Text>
        </Pressable>
        
        {/* Share Button */}
        <Pressable style={styles.actionButton} onPress={() => onShare(post.id)}>
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>↗️</Text>
          </View>
          <Text style={styles.actionCount}>{formatNumber(post.shares)}</Text>
        </Pressable>
        
        {/* Music Disc */}
        <View style={styles.musicDisc}>
          <View style={styles.discContainer}>
            <View style={styles.discInner}>
              <Text style={styles.discIcon}>🎵</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Bottom Left Content Info */}
      <View style={styles.bottomContent}>
        <View>
          <Text style={styles.username}>{post.username}</Text>
          <Text style={styles.description}>
            {post.description}{' '}
            {Array.isArray(post.hashtags)&& post.hashtags.length> 0 && (
              <Text style={styles.hashtags}>
                {post.hashtags.join('')}
              </Text>
            )}
          </Text>
        </View>
        
        {/* Music Info */}
        {post.musicTitle && (
          <View style={styles.musicInfo}>
            <Text style={styles.musicIcon}>🎵</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={styles.musicTitle}>{post.musicTitle}</Text>
            </ScrollView>
          </View>
        )}
      </View>
      
      {/* Video Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarFill} />
      </View>
    </View>
  );
};

// Main Feed Component
interface VideoFeedScreenProps {
  onLivePress?: () => void;
  userId?: string;
  onLoginPress?: () => void;
}

export const VideoFeedScreen: React.FC<VideoFeedScreenProps> = ({ onLivePress, userId, onLoginPress }) => {
  const [posts, setPosts] = useState<VideoPost[]>([]);
  const [activeTab, setActiveTab] = useState<'forYou' | 'following'>('forYou');
  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Load videos from Firestore
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const videos = await chargerVideos(20);
        if (videos && videos.length > 0) {
          const mapped: VideoPost[] = videos.map((v: any) => ({
            id: v.id,
            userId: v.userId,
            username: v.username || `@${v.userId?.substring(0, 8) || 'user'}`,
            avatar: v.userAvatar || 'https://picsum.photos/50',
            videoUrl: v.videoUrl || '',
            thumbnail: v.thumbnail || 'https://picsum.photos/400/600',
            description: v.description || '',
            hashtags: v.hashtags || [],
            musicTitle: v.musicTitle || 'Original Sound',
            likes: v.likesCount || 0,
            comments: v.commentsCount || 0,
            bookmarks: v.bookmarksCount || 0,
            shares: v.sharesCount || 0,
            isLiked: false,
            isBookmarked: false,
          }));
          setPosts(mapped);
        } else {
          console.log('No videos found in Firestore');
          setPosts([]);
        }
      } catch (err) {
        console.error('Error loading feed:', err);
        setPosts([]);
      }
    };
    loadVideos();
  }, []);

  const handleLike = async (id: string) => {
    if (userId) {
      try {
        await likerVideo(userId, id);
      } catch (err) {
        console.log('Error liking video:', err);
      }
    }
    setPosts(prev =>
      prev.map(post =>
        post.id === id
          ? { ...post, likes: post.likes + (post.isLiked ? -1 : 1), isLiked: !post.isLiked }
          : post
      )
    );
  };

  const handleBookmark = (id: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === id
          ? { ...post, bookmarks: post.bookmarks + (post.isBookmarked ? -1 : 1), isBookmarked: !post.isBookmarked }
          : post
      )
    );
  };

  const handleShare = (id: string) => {
    console.log('Share post:', id);
  };

  const handleComment = (id: string) => {
    console.log('Comment on post:', id);
  };

  const handleFollow = async (followedIdOrUsername: string) => {
    if (userId && !followedIdOrUsername.startsWith('@')) {
      try {
        await toggleFollow(userId, followedIdOrUsername);
        console.log('Follow toggled successfully');
      } catch (err) {
        console.log('Follow error:', err);
      }
    } else {
      console.log('Follow user:', followedIdOrUsername);
    }
  };

  const renderItem = ({ item }: { item: VideoPost }) => (
    <VideoSlide
      post={item}
      onLike={handleLike}
      onBookmark={handleBookmark}
      onShare={handleShare}
      onComment={handleComment}
      onFollow={handleFollow}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#131313" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.searchIcon}>🔍</Text>
        </View>
        <View style={styles.headerCenter}>
          <Pressable onPress={() => setActiveTab('following')}>
            <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextInactive]}>
              Following
            </Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab('forYou')}>
            <Text style={[styles.tabText, activeTab === 'forYou' && styles.tabTextActive]}>
              For You
            </Text>
          </Pressable>
        </View>
        <View style={styles.headerRight}>
          {!userId ? (
            <Pressable 
              onPress={onLoginPress}
              style={{ backgroundColor: '#00f0ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}
            >
              <Text style={{ color: '#00363a', fontWeight: 'bold', fontSize: 12 }}>LOGIN</Text>
            </Pressable>
          ) : (
            <Pressable onPress={onLivePress}>
              <Text style={styles.liveIcon}>📺</Text>
            </Pressable>
          )}
        </View>
      </View>
      
      {/* Video Feed */}
      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      />
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerLeft: {
    flex: 1,
  },
  searchIcon: {
    fontSize: 24,
    color: '#00f0ff',
  },
  headerCenter: {
    flexDirection: 'row',
    gap: 24,
  },
  tabText: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.01,
    color: 'rgba(226, 226, 226, 0.6)',
  },
  tabTextActive: {
    color: '#e2e2e2',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#00f0ff',
    paddingBottom: 4,
  },
  tabTextInactive: {
    color: 'rgba(226, 226, 226, 0.6)',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  liveIcon: {
    fontSize: 24,
    color: '#00f0ff',
  },
  videoSlide: {
    width: width,
    height: height,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sidebar: {
    position: 'absolute',
    right: 16,
    bottom: 128,
    alignItems: 'center',
    gap: 24,
    zIndex: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#00f0ff',
  },
  followButton: {
    position: 'absolute',
    bottom: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff4b89',
    alignItems: 'center',
    justifyContent: 'center',
  },
  followIcon: {
    fontSize: 14,
    color: '#66002c',
    fontWeight: 'bold',
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(19, 19, 19, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionIcon: {
    fontSize: 24,
  },
  actionIconLiked: {
    textShadowColor: '#ff4b89',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  actionIconBookmarked: {
    textShadowColor: '#00f0ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  actionCount: {
    fontSize: 12,
    lineHeight: 16,
    color: '#e2e2e2',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  musicDisc: {
    marginTop: 8,
  },
  discContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discIcon: {
    fontSize: 16,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 112,
    left: 20,
    right: 80,
    gap: 12,
    zIndex: 20,
  },
  username: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  hashtags: {
    fontWeight: 'bold',
    color: '#00f0ff',
  },
  musicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  musicIcon: {
    fontSize: 18,
    color: '#00f0ff',
  },
  musicTitle: {
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 88,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 30,
  },
  progressBarFill: {
    width: '33%',
    height: '100%',
    backgroundColor: '#00f0ff',
  },
  heartBurstContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -50,
    marginTop: -50,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  heartBurstIcon: {
    fontSize: 80,
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
    zIndex: 50,
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

export default VideoFeedScreen;