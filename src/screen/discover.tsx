import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  FlatList,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';


const { width, height: _height } = Dimensions.get('window');
const isSmallScreen = width < 380;


import * as videoService from '../services/videoService';

// Main Discover Component
interface DiscoverScreenProps {
  onLivePress?: () => void;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ onLivePress }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Trending');
  const [videos, setVideos] = useState<VideoItemType[]>([]);
  const [challenges] = useState<ChallengeItemType[]>([]);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const data = await videoService.chargerVideos(20);
        if (data && data.length > 0) {
          const mapped: VideoItemType[] = data.map((v: any) => ({
            id: v.id,
            thumbnail: v.thumbnail || '',
            views: v.viewsCount || 0,
            creator: {
              username: `@${v.userId?.substring(0, 8) || 'user'}`,
              avatar: '',
            },
          }));
          setVideos(mapped);
        } else {
          setVideos([]);
        }
      } catch (err) {
        console.log('Error loading discover videos:', err);
        setVideos([]);
      }
    };
    loadVideos();
  }, []);

  const handleVideoPress = (id: string) => {
    console.log('Video pressed:', id);
  };

  const handleChallengePress = (id: string) => {
    console.log('Challenge pressed:', id);
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
  };

  const formatVideosForMasonry = () => {
    const items = [];
    for (let i = 0; i < videos.length; i += 2) {
      items.push({
        left: videos[i],
        right: videos[i + 1],
      });
    }
    return items;
  };

  const renderMasonryRow = ({ item }: { item: { left: VideoItemType; right?: VideoItemType } }) => (
    <View style={styles.masonryRow}>
      <View style={styles.masonryLeft}>
        <VideoItem item={item.left} onPress={handleVideoPress} />
      </View>
      {item.right && (
        <View style={styles.masonryRight}>
          <VideoItem item={item.right} onPress={handleVideoPress} />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#131313" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>For You</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerButton}>
            <Text style={styles.headerIcon}>🔍</Text>
          </Pressable>
          <Pressable style={styles.headerButton} onPress={onLivePress}>
            <Text style={styles.headerIcon}>📺</Text>
          </Pressable>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search creators, vibes, or tracks..."
              placeholderTextColor="rgba(185, 202, 203, 0.6)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {CATEGORIES.map((category) => (
              <Pressable
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive,
                ]}
                onPress={() => handleCategoryPress(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Trending Challenges */}
        {challenges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🔥</Text>
              <Text style={styles.sectionTitle}>Trending Challenges</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.challengesScroll}>
              {challenges.map((challenge) => (
                <ChallengeItem key={challenge.id} item={challenge} onPress={handleChallengePress} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recommended Videos */}
        {videos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <FlatList
              data={formatVideosForMasonry()}
              renderItem={renderMasonryRow}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Bottom padding for navigation */}
        <View style={styles.bottomPadding} />
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
  headerTitle: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: '800',
    letterSpacing: -0.02,
    color: '#00f0ff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(19, 19, 19, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 20,
    color: '#00f0ff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: 'rgba(42, 42, 42, 0.4)',
    borderRadius: 999,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchIcon: {
    fontSize: 20,
    color: 'rgba(185, 202, 203, 0.6)',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#e2e2e2',
    padding: 0,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoriesScroll: {
    gap: 16,
  },
  categoryButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(19, 19, 19, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryButtonActive: {
    backgroundColor: '#00f0ff',
  },
  categoryText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: 'rgba(226, 226, 226, 0.6)',
  },
  categoryTextActive: {
    color: '#00363a',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 20,
    color: '#ffb1c3',
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.01,
    color: '#00f0ff',
  },
  challengesScroll: {
    paddingLeft: 20,
    gap: 16,
  },
  challengeCard: {
    width: 280,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  cyanBorder: {
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.5)',
  },
  pinkBorder: {
    shadowColor: '#ffb1c3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 177, 195, 0.5)',
  },
  challengeImage: {
    width: '100%',
    height: '100%',
  },
  challengeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  challengeTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cyanText: {
    color: '#7df4ff',
  },
  pinkText: {
    color: '#ffb1c3',
  },
  challengeParticipants: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  videoItem: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  viewCountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(19, 19, 19, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  viewCountIcon: {
    fontSize: 12,
    color: '#ffffff',
  },
  viewCountText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#ffffff',
  },
  creatorInfo: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creatorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  creatorUsername: {
    fontSize: 12,
    lineHeight: 16,
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  masonryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  masonryLeft: {
    flex: 1,
  },
  masonryRight: {
    flex: 1,
    marginTop: 24,
  },
  bottomPadding: {
    height: 80,
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

export default DiscoverScreen;