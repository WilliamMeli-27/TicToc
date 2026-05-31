import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
  StatusBar,
  ScrollView,
  PanResponder,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 380;

// Types
interface TimelineTrack {
  id: string;
  type: 'video' | 'audio' | 'text' | 'sticker';
  startTime: number;
  duration: number;
  data: any;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

interface Sticker {
  id: string;
  icon: string;
  x: number;
  y: number;
}

export const VideoEditorScreen: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(4); // seconds
  const [totalDuration, setTotalDuration] = useState(15);
  const [isPlaying, setIsPlaying] = useState(false);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([
    { id: '1', text: 'NIGHT VIBES', x: width / 2 - 80, y: height * 0.25, fontSize: 20, color: '#00f0ff' },
  ]);
  const [stickers, setStickers] = useState<Sticker[]>([
    { id: '1', icon: '⭐', x: width / 2 - 20, y: height * 0.65 },
  ]);
  
  // Animation values
  const playheadAnim = useRef(new Animated.Value(currentTime)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const timelineScale = useRef(new Animated.Value(1)).current;
  
  // Refs
  const timelineScrollRef = useRef<ScrollView>(null);
  const playInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate video playback
  useEffect(() => {
    if (isPlaying) {
      playInterval.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      if (playInterval.current) {
        clearInterval(playInterval.current);
      }
    }
    
    return () => {
      if (playInterval.current) {
        clearInterval(playInterval.current);
      }
    };
  }, [isPlaying, totalDuration]);

  // Animate playhead
  useEffect(() => {
    Animated.timing(playheadAnim, {
      toValue: (currentTime / totalDuration) * 100,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [currentTime]);

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle seek
  const handleSeek = (value: number) => {
    setIsPlaying(false);
    setCurrentTime(value);
  };

  // Handle timeline scroll
  const handleTimelineScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.setValue(offsetX);
  };

  // Handle text overlay drag
  const createTextPanResponder = (id: string, initialX: number, initialY: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        setTextOverlays(prev =>
          prev.map(item =>
            item.id === id
              ? { ...item, x: initialX + gestureState.dx, y: initialY + gestureState.dy }
              : item
          )
        );
      },
    });
  };

  // Handle sticker drag
  const createStickerPanResponder = (id: string, initialX: number, initialY: number) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        setStickers(prev =>
          prev.map(item =>
            item.id === id
              ? { ...item, x: initialX + gestureState.dx, y: initialY + gestureState.dy }
              : item
          )
        );
      },
    });
  };

  // Generate waveform bars
  const renderWaveform = () => {
    const heights = [30, 50, 80, 60, 40, 90, 20, 40, 30, 50, 80, 60, 40, 90, 20, 40, 30, 50, 80, 60, 40, 90, 20, 40];
    return heights.map((height, index) => (
      <View key={index} style={[styles.waveformBar, { height: `${height}%` }]} />
    ));
  };

  // Render thumbnail strips
  const renderThumbnails = () => {
    return [1, 2, 3, 4, 5].map((_, index) => (
      <View key={index} style={styles.thumbnail} />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#131313" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerButton}>
          <Text style={styles.headerIcon}>✕</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Edit Video</Text>
        <Pressable style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
        </Pressable>
      </View>
      
      {/* Video Preview Container */}
      <View style={styles.previewContainer}>
        <View style={styles.videoFrame}>
          {/* Video Background */}
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJd8IosUXbi1CHH0uXb19RtcBiN-B1OoMkI6rAAlKj2OKV7qKj5fG-uDLkd9sWbnO0MZGXI62nSu8i3IELrror3NEipNsh0N-2Vl7xTXSCv0NX36NXY2-Bzpjv62Tlruw7AXBto1BLmBhQ8SAHlKs7uutA9GLRZhYIO4ij8W88uhHYBZLVu9dZEDvUb04udO7Tn_XUY0XMgUzl8F8kUllLB1qABY4oxuEIaDM73R_Ofp4oSLYdDgAzhFA-q9ef5_rqkyDfP2PVipvF' }}
            style={styles.videoBackground}
            resizeMode="cover"
          />
          
          {/* Text Overlays */}
          {textOverlays.map((text) => {
            const panResponder = createTextPanResponder(text.id, text.x, text.y);
            return (
              <Animated.View
                key={text.id}
                style={[styles.textOverlay, { top: text.y, left: text.x }]}
                {...panResponder.panHandlers}
              >
                <View style={styles.textBubble}>
                  <Text style={[styles.overlayText, { fontSize: text.fontSize, color: text.color }]}>
                    {text.text}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
          
          {/* Stickers */}
          {stickers.map((sticker) => {
            const panResponder = createStickerPanResponder(sticker.id, sticker.x, sticker.y);
            return (
              <Animated.View
                key={sticker.id}
                style={[styles.stickerOverlay, { top: sticker.y, left: sticker.x }]}
                {...panResponder.panHandlers}
              >
                <View style={styles.stickerBubble}>
                  <Text style={styles.stickerIcon}>{sticker.icon}</Text>
                </View>
              </Animated.View>
            );
          })}
          
          {/* Playback Controls Overlay */}
          <Pressable style={styles.playOverlay} onPress={handlePlayPause}>
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            </View>
          </Pressable>
          
          {/* Safe Area Grid */}
          <View style={styles.gridOverlay}>
            <View style={styles.gridLineHorizontal} />
            <View style={[styles.gridLineHorizontal, { top: '66.67%' }]} />
            <View style={styles.gridLineVertical} />
            <View style={[styles.gridLineVertical, { left: '66.67%' }]} />
          </View>
        </View>
        
        {/* Time Indicator */}
        <View style={styles.timeIndicator}>
          <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeSeparator}>/</Text>
          <Text style={styles.totalTime}>{formatTime(totalDuration)}</Text>
        </View>
      </View>
      
      {/* Timeline Section */}
      <View style={styles.timelineContainer}>
        {/* Timeline Metadata */}
        <View style={styles.timelineHeader}>
          <View style={styles.timelineActions}>
            <Pressable style={styles.timelineAction}>
              <Text style={styles.timelineActionIcon}>↩️</Text>
            </Pressable>
            <Pressable style={styles.timelineAction}>
              <Text style={styles.timelineActionIcon}>↪️</Text>
            </Pressable>
          </View>
          <Pressable style={styles.splitButton}>
            <Text style={styles.splitButtonText}>Split Clip</Text>
          </Pressable>
        </View>
        
        {/* Scrollable Timeline Tracks */}
        <ScrollView
          ref={timelineScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleTimelineScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.timelineContent}
        >
          <View style={styles.tracksContainer}>
            {/* Text Track */}
            <View style={styles.track}>
              <View style={[styles.trackItem, styles.textTrackItem]}>
                <Text style={styles.textTrackText}>NIGHT VIBES</Text>
              </View>
            </View>
            
            {/* Stickers Track */}
            <View style={styles.track}>
              <View style={[styles.trackItem, styles.stickerTrackItem]}>
                <Text style={styles.stickerTrackIcon}>⭐</Text>
              </View>
            </View>
            
            {/* Main Video Track */}
            <View style={[styles.track, styles.videoTrack]}>
              <View style={styles.videoTrackContent}>
                {/* Thumbnails */}
                <View style={styles.thumbnailsContainer}>
                  {renderThumbnails()}
                </View>
                {/* Waveform */}
                <View style={styles.waveformContainer}>
                  {renderWaveform()}
                </View>
              </View>
              {/* Draggable Handles */}
              <View style={styles.leftHandle}>
                <View style={styles.handleDot} />
              </View>
              <View style={styles.rightHandle}>
                <View style={styles.handleDot} />
              </View>
            </View>
            
            {/* Audio Track */}
            <View style={styles.track}>
              <View style={styles.audioTrackItem}>
                <Text style={styles.audioIcon}>🎵</Text>
                <Text style={styles.audioText}>Cyberpunk 2077 Mix.mp3</Text>
              </View>
            </View>
          </View>
        </ScrollView>
        
        {/* Playhead (Fixed Center) */}
        <View style={styles.playheadContainer}>
          <View style={styles.playheadLine} />
          <View style={styles.playheadDot} />
        </View>
      </View>
      
      {/* Toolbar / Footer */}
      <View style={styles.toolbar}>
        <Pressable style={styles.toolbarItem}>
          <Text style={styles.toolbarIcon}>✂️</Text>
          <Text style={styles.toolbarLabel}>Trim</Text>
        </Pressable>
        <Pressable style={styles.toolbarItem}>
          <Text style={styles.toolbarIcon}>⎚</Text>
          <Text style={styles.toolbarLabel}>Split</Text>
        </Pressable>
        <Pressable style={styles.toolbarItem}>
          <Text style={styles.toolbarIcon}>🎨</Text>
          <Text style={styles.toolbarLabel}>Filters</Text>
        </Pressable>
        <Pressable style={styles.toolbarItem}>
          <Text style={styles.toolbarIcon}>✨</Text>
          <Text style={styles.toolbarLabel}>Effects</Text>
        </Pressable>
        <Pressable style={styles.toolbarItem}>
          <Text style={styles.toolbarIcon}>🔄</Text>
          <Text style={styles.toolbarLabel}>Transitions</Text>
        </Pressable>
      </View>
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
    backgroundColor: 'rgba(19, 19, 19, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 20,
    color: '#00f0ff',
  },
  headerTitle: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: '800',
    letterSpacing: -0.02,
    color: '#00f0ff',
  },
  nextButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#00f0ff',
    borderRadius: 999,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00363a',
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  videoFrame: {
    width: width * 0.8,
    aspectRatio: 9 / 16,
    backgroundColor: '#1b1b1b',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  videoBackground: {
    width: '100%',
    height: '100%',
  },
  textOverlay: {
    position: 'absolute',
  },
  textBubble: {
    backgroundColor: 'rgba(19, 19, 19, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  overlayText: {
    fontWeight: '600',
  },
  stickerOverlay: {
    position: 'absolute',
  },
  stickerBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(19, 19, 19, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  stickerIcon: {
    fontSize: 28,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    opacity: 0,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(19, 19, 19, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 32,
    color: '#ffffff',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '33.33%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33.33%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  timeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  currentTime: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#7df4ff',
  },
  timeSeparator: {
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(185, 202, 203, 0.3)',
  },
  totalTime: {
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(185, 202, 203, 0.6)',
  },
  timelineContainer: {
    backgroundColor: 'rgba(19, 19, 19, 0.4)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 16,
    paddingBottom: 24,
    position: 'relative',
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  timelineActions: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineActionIcon: {
    fontSize: 18,
    color: 'rgba(185, 202, 203, 0.8)',
  },
  splitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  splitButtonText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#00f0ff',
  },
  timelineContent: {
    paddingHorizontal: width / 2,
  },
  tracksContainer: {
    width: 1200,
    gap: 8,
  },
  track: {
    height: 32,
    position: 'relative',
  },
  videoTrack: {
    height: 64,
  },
  trackItem: {
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textTrackItem: {
    width: 128,
    marginLeft: 80,
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  textTrackText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#00f0ff',
  },
  stickerTrackItem: {
    width: 48,
    marginLeft: 256,
    backgroundColor: 'rgba(255, 177, 195, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 177, 195, 0.3)',
  },
  stickerTrackIcon: {
    fontSize: 12,
    color: '#ffb1c3',
  },
  videoTrackContent: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    height: 48,
    gap: 4,
    padding: 4,
  },
  thumbnail: {
    width: 64,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 64,
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  waveformBar: {
    width: 4,
    backgroundColor: '#00f0ff',
    borderRadius: 2,
    opacity: 0.4,
  },
  leftHandle: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 12,
    backgroundColor: '#7df4ff',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightHandle: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 12,
    backgroundColor: '#7df4ff',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleDot: {
    width: 4,
    height: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 2,
  },
  audioTrackItem: {
    flex: 1,
    height: 32,
    backgroundColor: 'rgba(162, 239, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(162, 239, 0, 0.2)',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  audioIcon: {
    fontSize: 16,
    color: '#a2ef00',
  },
  audioText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: '#a2ef00',
  },
  playheadContainer: {
    position: 'absolute',
    top: 16,
    bottom: 24,
    left: '50%',
    width: 2,
    alignItems: 'center',
    zIndex: 40,
  },
  playheadLine: {
    width: 2,
    height: '100%',
    backgroundColor: '#00f0ff',
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  playheadDot: {
    position: 'absolute',
    top: -4,
    left: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00f0ff',
  },
  toolbar: {
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
  toolbarItem: {
    alignItems: 'center',
    gap: 4,
  },
  toolbarIcon: {
    fontSize: 20,
    color: 'rgba(185, 202, 203, 0.6)',
  },
  toolbarLabel: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '600',
    color: 'rgba(185, 202, 203, 0.6)',
  },
});

export default VideoEditorScreen;