import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
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
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 380;

// Types
interface Creator {
  id: string;
  username: string;
  avatar: string;
}

interface VideoItem {
  id: string;
  thumbnail: string;
  views: number;
  creator: Creator;
  aspectRatio: '9:16' | '9:12' | '9:14';
}

interface ChallengeItem {
  id: string;
  title: string;
  participants: string;
  thumbnail: string;
  variant: 'cyan' | 'pink';
}

// Mock data
const mockChallenges: ChallengeItem[] = [
  {
    id: '1',
    title: '#CyberDance2024',
    participants: '1.2M Participating',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCEUdLBWbYZ6dMYrehq0azz9IrDCjWz5kRtW0KepUQ2aTwFP5t6e5nxwHMMnkw_XociU7Xtp6fQtVfnkKpQ_0DYoAdgUAkdt6_L7xhzt_Q_NuANJbovnQzdXEsnooqYm9jtAo_w6T26RKfC7MCe-VNdD0zicvwUOHRnZct7yltSRdWC7jde4cL3THIo6eKqrp9Yl7eQa-759x0EwDvDDlFvWPqY0hhO9iwgJjcxSuH6gAZ7KD0cjorm22LtgNuDKlTppWdiQAZolQn',
    variant: 'cyan',
  },
  {
    id: '2',
    title: '#RetroGamingVibe',
    participants: '850K Participating',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLiznwNRn_-L4AfMzj5Z6AmcEXdmnuTaoA24inP46SMhlYb8xlf9TgnYKTmtDEsmH0p-LIxGUXYSAFrqsGeSi1J2uhNx_39bcw4PBRKyoLQdRa-PU4nzC5oFcQTfHc6LGe4H9qAFEUheHiAhGotB5h0tOlKxM_CZP9QEqcob2blNioQ8snbXXjh6gU2L1upolFQ0TXD1BvHcRRxSgIIm_1OIoz25EJIpaN9F9Wh5AJHG6k13g1MpaGTTRjKN7M525OhEeDJVJlIStV',
    variant: 'pink',
  },
];

const mockVideos: VideoItem[] = [
  {
    id: '1',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6zQEh2NtjtUGwp0U5MHPa8gqo-1U4YoP0giD0-wzCWoTdJqXnZ4E2KwrJRkbQGFRDn3Q4pY_R8TZ1T2sTx6Isdnb-VG0oaaas62x8t1AATMYphZwaxG5e3p38r_faSY-RNhpPBhX1dVlJLYJPTXevd--0XUzfyAvMVj0k9-uJndX4pEQgPSQsJG__Ulcyt0TlsYnXoqp-Wft-a7QAgxUsQewY6jFXOw0TFUdJA1y_T_89fZCD-XteTa_sNaVagf4uB2XylY4lSo5X',
    views: 4200000,
    creator: {
      id: 'c1',
      username: '@alex_vibe',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2Q_-eQgH4KeVkDSqhXiZaE4AFLSZbkH_4zZUJDnUeGTedy79nFphNoP6ZA6OKZdFlzifMdHHsgDwvO8z2osfYS2sMRraAAjeq8bb091zxto0YezhqFzJAogXwpRu9hhHfhAC3380jiaIhKCoh4MGh8yZ5jSAt-U_78auaBnTJT4y_N8C9ZUCpLIdTwuTIwabxvNbIQVbU9uCbfPRfYHdzzLGyEqeMXxyv6mElGm3d-b1IgG4ozYvRKbSi0tsD_A1IuJfOYnusURE1',
    },
    aspectRatio: '9:16',
  },
  {
    id: '2',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClfG5AQyHzoup8dUXnuRcFc1gzyOqst4S53gxr-s5OCRCEWsC779x5OWuO_AEPtvrPFVT4c_jgMwZNEHsSofEQxSA42xIHb3pjq61pvHMGkKQqEnHjUzGRKo_sh53d7sQURcNJufUL9862upCOyGty3lvsVGIFA0LpJVNzs72BMbGBjNvMmGD2yKWk4kVxZPlaFsYl8ebTNed1y1Zdr-clsBFPO-XuuD0sMys84q1yczwwthfEjEB0rb9IYh-35dVnwuu8eXHD6kz1',
    views: 1800000,
    creator: {
      id: 'c2',
      username: '@maya_dance',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfcfivmbd7rcMceWmN1B4dsRAD-TfSlRLy42rlMdh3_Ff4Pk9CRmqxqvZgBwTz-MKkt4Imbv6mF1gWCei1ix4mI7cxWaBKbTVhLHLom9yS3erTTomeWWTTlHynBzOVb31NWHXTCATEquVRUglrr0RewzdgLI4R2LH0gtfppWPNTjgSHguxjkg6NpUsQ1eR0G_W-chhQqgLek1U1RcTcTjlaFwcOi9dyMXp9cBF8lSzuAyJCelEeCRNABDc1LtENodE4SB91gX29QWC',
    },
    aspectRatio: '9:12',
  },
  {
    id: '3',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCT4IRwp41raHvxw54FZTQnMFHBRCYNh6MqdcnU4GL4i4ZeH-3YdyitYBLRLULPImi1erBOwghJAXNctsDrcnFhuBmqs0zmkOnrQ-NPWMev4Lgu8-FsoAvAzWvA2jR_lIXglUlwEWCY0jPozDcn6GV8CFlQS9uR6L5--txrUpwXVruK5Visyt7r6WCedcESvNHO8xYxC-3mBg8mnhoTTcHAQ5L7woFU_nTo93ztJRRo_NhZi2EhbmGKYb9T58M-0YboHV4mX0erD4uR',
    views: 890000,
    creator: {
      id: 'c3',
      username: '@tech_guru',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCM9jVPWq3jXyYTvCVpXe1tG_0JP9I93XHkJn8Rnfc5mj7MBBTN9jv2skpNMIKV3x3FvgIlMce9ErKZwYsv1eAvH7fBgeSbsruk0V5PixIY0HM5cjcvcuaPKNjkzITz-nI_AdYY-ZbAqOaJxantdpfpkfrw8CfhNLN0wgAeOjTeinQ1he7UROA6Ejy4xkNRJHKFeVOfPbPpDRzA8iKlGXB7DP5TuSDt0jNdrtKy-KcQ6UFtXxWqvAumHylkCqLkDY9XaAjfoOd6PxPe',
    },
    aspectRatio: '9:14',
  },
  {
    id: '4',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAn1bDZl2euz0ZOA7H9XG4GSgGDElr-uoO_hDyuAOmPba-EkUWw-qjeqjk4MMrAUAH_F08w5ARccAQ482acqkazTTS-DeTGTB3LtFzEzWL47q8_NL-gkug9H-D9zfmlm3CI2-cY2a3BlAnktny3ahlIAtDOlcp945Vv5EDTNgYztJgUcpoKi_sePpGetxpiKuwJBjTMOQKHXJflKbLsHP2U0E0t2HheNeJcttdlEOafx2vHK5MmFvZzADsoMlhHhdwr51kaOH1p2388',
    views: 2500000,
    creator: {
      id: 'c4',
      username: '@creative_soul',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlN1Yx_vQbEup7i6b6qKPmK-HVXclal1OibHUQO3eFOTxzHGvW2I81UbN9qavMCt8Ev2ujCNXF1FrpWKgwFDoU95POTq7SxRbmnxhqljcXJzQGFHj5Bqxew3TO9BwGu_-SHdivVZ96kfB2M-sgTsgffW9L87GtLNG2mpOv_6riDGSPFgxApclcyy46HKoaQW0BEg6l9Oq1gLALRjrFkD6klMSUtBm5JEyhndjie2ywpyS4US-ji71omNhAXkFyOLemwuz5V5ZtN4X8',
    },
    aspectRatio: '9:16',
  },
];

const CATEGORIES = ['Trending', 'Dance', 'Comedy', 'Tech', 'Music', 'Gaming'];

// Video Item Component
const VideoItem: React.FC<{ item: VideoItem; onPress: (id: string) => void }> = ({ item, onPress }) => {
  const getAspectRatio = () => {
    switch (item.aspectRatio) {
      case '9:16': return 9 / 16;
      case '9:12': return 9 / 12;
      case '9:14': return 9 / 14;
      default: return 9 / 16;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Pressable 
      style={[styles.videoItem, { aspectRatio: getAspectRatio() }]}
      onPress={() => onPress(item.id)}

    >
      <Image source={{ uri: item.thumbnail }} style={styles.videoThumbnail} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(0,0,0,0.2)', 'transparent', 'rgba(0,0,0,0.6)']}
        style={styles.videoOverlay}
      />
      <View style={styles.viewCountBadge}>
        <Text style={styles.viewCountIcon}>👁️</Text>
        <Text style={styles.viewCountText}>{formatNumber(item.views)}</Text>
      </View>
      <View style={styles.creatorInfo}>
        <Image source={{ uri: item.creator.avatar }} style={styles.creatorAvatar} />
        <Text style={styles.creatorUsername}>{item.creator.username}</Text>
      </View>
    </Pressable>
  );
};

// Challenge Item Component
const ChallengeItem: React.FC<{ item: ChallengeItem; onPress: (id: string) => void }> = ({ item, onPress }) => {
  const isCyan = item.variant === 'cyan';
  
  return (
    <Pressable 
      style={[styles.challengeCard, isCyan ? styles.cyanBorder : styles.pinkBorder]}
      onPress={() => onPress(item.id)}

    >
      <Image source={{ uri: item.thumbnail }} style={styles.challengeImage} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.challengeOverlay}
      >
        <Text style={[styles.challengeTitle, isCyan ? styles.cyanText : styles.pinkText]}>
          {item.title}
        </Text>
        <Text style={styles.challengeParticipants}>{item.participants}</Text>
      </LinearGradient>
    </Pressable>
  );
};

// Main Discover Component
interface DiscoverScreenProps {
  onLivePress?: () => void;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ onLivePress }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Trending');
  const [videos, _setVideos] = useState<VideoItem[]>(mockVideos);
  const _scrollY = useRef(new Animated.Value(0)).current;

  const handleVideoPress = (id: string) => {
    console.log('Video pressed:', id);
  };

  const handleChallengePress = (id: string) => {
    console.log('Challenge pressed:', id);
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
    // Filter videos based on category
    // This would typically fetch from an API
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

  const renderMasonryRow = ({ item }: { item: { left: VideoItem; right?: VideoItem } }) => (
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🔥</Text>
            <Text style={styles.sectionTitle}>Trending Challenges</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.challengesScroll}>
            {mockChallenges.map((challenge) => (
              <ChallengeItem key={challenge.id} item={challenge} onPress={handleChallengePress} />
            ))}
          </ScrollView>
        </View>

        {/* Recommended Videos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <FlatList
            data={formatVideosForMasonry()}
            renderItem={renderMasonryRow}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
        </View>

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