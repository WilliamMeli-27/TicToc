import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
const { width: _width, height: _height } = Dimensions.get('window');

// ── Type Definitions ──────────────────────────────────
interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: Date;
  isSystem?: boolean;
  isTopFan?: boolean;
}

interface Reaction {
  id: string;
  icon: string;
  color: string;
  x: number;
}

// ── Constants ──────────────────────────────────────────
const REACTION_ICONS = [
  { icon: '❤️', color: '#ff4b89' },
  { icon: '🔥', color: '#ff6b35' },
  { icon: '😍', color: '#ffb1c3' },
  { icon: '👏', color: '#a2ef00' },
  { icon: '💎', color: '#00f0ff' },
  { icon: '🎉', color: '#ff4b89' },
];

const hostInfoMock = {
  username: 'CyberNova',
  followers: '2.4M followers',
  avatar: 'https://picsum.photos/100',
};

export const LiveStreamScreen: React.FC<{ onBackPress?: () => void }> = ({ onBackPress }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [inputText, setInputText] = useState('');
  const [viewerCount, setViewerCount] = useState(2841);
  const [isFollowing, setIsFollowing] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const reactionContainerRef = useRef<View>(null);
  const reactionAnimRefs = useRef<{ [key: string]: Animated.Value }>({});

  // Simulate viewer count increase
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 10));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulate random comments
  useEffect(() => {
    const mockNames = ['Pixel_Art', 'Synth_Wave', 'GlitchCat', 'NeonVibes', 'CyberPunk', 'VaporWave'];
    const mockTexts = [
      'LETS GOOO!', 
      'Pure talent right here', 
      'Subscribing now!', 
      'Love the energy today',
      '🔥🔥🔥',
      'Best stream ever!'
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newComment: Comment = {
          id: Date.now().toString(),
          username: mockNames[Math.floor(Math.random() * mockNames.length)],
          text: mockTexts[Math.floor(Math.random() * mockTexts.length)],
          timestamp: new Date(),
        };
        setComments(prev => [...prev, newComment]);
        
        // Auto scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
      
      // Limit comments to 20
      setComments(prev => {
        if (prev.length > 20) return prev.slice(-20);
        return prev;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Clean up old reactions
  useEffect(() => {
    const interval = setInterval(() => {
      setReactions(prev => prev.filter(r => {
        const anim = reactionAnimRefs.current[r.id];
        return anim && (anim as any)._value < 1;
      }));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Send comment
  const handleSendComment = () => {
    if (!inputText.trim()) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      username: 'You',
      text: inputText.trim(),
      timestamp: new Date(),
    };
    setComments(prev => [...prev, newComment]);
    setInputText('');
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Create reaction animation
  const createReaction = () => {
    const randomIcon = REACTION_ICONS[Math.floor(Math.random() * REACTION_ICONS.length)];
    const randomX = Math.random() * 60;
    const reactionId = Date.now().toString();
    const animValue = new Animated.Value(0);
    
    reactionAnimRefs.current[reactionId] = animValue;
    
    setReactions(prev => [...prev, {
      id: reactionId,
      icon: randomIcon.icon,
      color: randomIcon.color,
      x: randomX,
    }]);
    
    Animated.timing(animValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setReactions(prev => prev.filter(r => r.id !== reactionId));
      delete reactionAnimRefs.current[reactionId];
    });
  };

  // Handle like button press (creates 3 reactions)
  const handleLike = () => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => createReaction(), i * 100);
    }
  };

  // Handle gift button press
  const handleGift = () => {
    // Visual feedback handled in component
    console.log('Gift pressed');
  };

  // Handle follow
  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  // Handle share
  const handleShare = () => {
    console.log('Share pressed');
  };

  // Handle close
  const handleClose = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      console.log('Close pressed');
    }
  };

  // Format number with K/M
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Render comment bubble
  const renderComment = ({ item }: { item: Comment }) => (
    <View style={[
      styles.commentBubble,
      item.isSystem && styles.systemComment,
    ]}>
      <View style={styles.commentHeader}>
        <Text style={[
          styles.commentUsername,
          item.isSystem && styles.systemUsername,
        ]}>
          {item.username}
        </Text>
        {item.isTopFan && (
          <View style={styles.topFanBadge}>
            <Text style={styles.topFanText}>Top Fan</Text>
          </View>
        )}
        {item.isSystem && (
          <Text style={styles.verifiedIcon}>✓</Text>
        )}
      </View>
      <Text style={[
        styles.commentText,
        item.isSystem && styles.systemText,
      ]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Video Background */}
      <View style={styles.backgroundContainer}>
        <Image 
          source={{ uri: 'https://picsum.photos/400/800' }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(19, 19, 19, 0.4)', 'transparent', 'rgba(19, 19, 19, 0.8)']}
          style={styles.gradientOverlay}
        />
      </View>

      {/* Top Navigation Overlay */}
      <View style={styles.header}>
        {/* Host Info & LIVE Badge */}
        <View style={styles.hostInfo}>
          <View style={styles.hostCard}>
            <Image 
              source={{ uri: hostInfoMock.avatar }}
              style={styles.hostAvatar}
            />
            <View>
              <Text style={styles.hostName}>{hostInfoMock.username}</Text>
              <Text style={styles.followerCount}>{hostInfoMock.followers}</Text>
            </View>
            <Pressable 
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={handleFollow}
            >
              <Text style={[styles.followText, isFollowing && styles.followingText]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </Pressable>
          </View>
          
          <View style={styles.liveInfo}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <View style={styles.viewerBadge}>
              <Text style={styles.viewerIcon}>👁️</Text>
              <Text style={styles.viewerCount}>{formatNumber(viewerCount)}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionIcon}>↗️</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleClose}>
            <Text style={styles.actionIcon}>✕</Text>
          </Pressable>
        </View>
      </View>

      {/* Bottom Left: Comments Section */}
      <View style={styles.commentsContainer}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.commentsScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.commentsContent}
        >
          {comments.map((comment) => (
            <View key={comment.id}>
              {renderComment({ item: comment })}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Floating Reactions Container */}
      <View style={styles.reactionsContainer} ref={reactionContainerRef}>
        {reactions.map((reaction) => {
          const anim = reactionAnimRefs.current[reaction.id];
          if (!anim) return null;
          
          const translateY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -100],
          });
          const scale = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.5],
          });
          const opacity = anim.interpolate({
            inputRange: [0, 0.7, 1],
            outputRange: [1, 0.5, 0],
          });
          
          return (
            <Animated.View
              key={reaction.id}
              style={[
                styles.reaction,
                {
                  left: reaction.x,
                  transform: [{ translateY }, { scale }],
                  opacity,
                },
              ]}
            >
              <Text style={[styles.reactionIcon, { color: reaction.color }]}>
                {reaction.icon}
              </Text>
            </Animated.View>
          );
        })}
      </View>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {/* Comment Input Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Say something..."
            placeholderTextColor="rgba(185, 202, 203, 0.6)"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSendComment}
          />
          <Pressable style={styles.sendButton} onPress={handleSendComment}>
            <Text style={styles.sendIcon}>📤</Text>
          </Pressable>
        </View>

        {/* Gift & Reactions Group */}
        <View style={styles.actionGroup}>
          <Pressable style={styles.giftButton} onPress={handleGift}>
            <Text style={styles.giftIcon}>🎁</Text>
          </Pressable>
          <Pressable style={styles.likeButton} onPress={handleLike}>
            <Text style={styles.likeIcon}>❤️</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    zIndex: 20,
  },
  hostInfo: {
    gap: 12,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(19, 19, 19, 0.4)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#00f0ff',
  },
  hostName: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 'bold',
    color: '#e2e2e2',
  },
  followerCount: {
    fontSize: 10,
    color: '#7df4ff',
    textTransform: 'uppercase',
  },
  followButton: {
    backgroundColor: '#ff4b89',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  followingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  followText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#66002c',
  },
  followingText: {
    color: '#e2e2e2',
  },
  liveInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ff4b89',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#66002c',
  },
  liveText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#66002c',
  },
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(19, 19, 19, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  viewerIcon: {
    fontSize: 12,
    color: '#e2e2e2',
  },
  viewerCount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#e2e2e2',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(19, 19, 19, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionIcon: {
    fontSize: 20,
    color: '#e2e2e2',
  },
  commentsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    width: '70%',
    maxWidth: 400,
    zIndex: 30,
  },
  commentsScroll: {
    maxHeight: 256,
  },
  commentsContent: {
    gap: 12,
  },
  commentBubble: {
    backgroundColor: 'rgba(19, 19, 19, 0.4)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  systemComment: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e2e2e2',
  },
  systemUsername: {
    color: '#00f0ff',
  },
  topFanBadge: {
    backgroundColor: '#a2ef00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  topFanText: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#223600',
  },
  verifiedIcon: {
    fontSize: 12,
    color: '#00f0ff',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#e2e2e2',
  },
  systemText: {
    color: '#00f0ff',
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
  reactionsContainer: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 100,
    height: 200,
    pointerEvents: 'none',
    zIndex: 40,
  },
  reaction: {
    position: 'absolute',
    bottom: 0,
  },
  reactionIcon: {
    fontSize: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    paddingTop: 16,
    zIndex: 50,
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
  },
  input: {
    height: 48,
    backgroundColor: 'rgba(42, 42, 42, 0.4)',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingRight: 56,
    fontSize: 16,
    color: '#e2e2e2',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    fontSize: 18,
    color: '#7df4ff',
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  giftButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(19, 19, 19, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  giftIcon: {
    fontSize: 24,
    color: '#ffb1c3',
  },
  likeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00f0ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeIcon: {
    fontSize: 24,
    color: '#00363a',
  },
});

export default LiveStreamScreen;