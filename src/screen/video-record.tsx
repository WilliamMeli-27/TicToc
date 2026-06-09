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
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { ModeType, cameraAssets } from './CameraItems';

const { width: _width, height: _height } = Dimensions.get('window');

interface CameraScreenProps {
  onOpenEditor?: () => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({ onOpenEditor }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [selectedMode, setSelectedMode] = useState<ModeType>('VIDEO');
  const [_isCameraReady, _setIsCameraReady] = useState(false);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back');
  
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordScaleAnim = useRef(new Animated.Value(1)).current;
  const innerScaleAnim = useRef(new Animated.Value(1)).current;
  const ringScaleAnim = useRef(new Animated.Value(1)).current;
  const flipRotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === cameraPosition) ?? devices[0];

  // Animate progress bar
  useEffect(() => {
    if (isRecording) {
      progressInterval.current = setInterval(() => {
        setCurrentProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval.current!);
            return 100;
          }
          return prev + 0.5;
        });
      }, 100);
    } else {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      setCurrentProgress(0);
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isRecording]);

  // Animate progress bar width
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentProgress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [currentProgress]);

  // Handle record button press
  const _handleRecordPress = () => {
    // Button scale animation
    Animated.sequence([
      Animated.spring(recordScaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.spring(recordScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }),
    ]).start();
    
    // Inner button animation
    Animated.spring(innerScaleAnim, {
      toValue: isRecording ? 1 : 0.5,
      useNativeDriver: true,
      speed: 50,
    }).start();
    
    // Ring animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringScaleAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(ringScaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      // Simulate haptic feedback
      // Vibration.vibrate(5);
    } else {
      // Stop recording
      setIsRecording(false);
      ringScaleAnim.setValue(1);
    }
  };

  // Handle flip camera
  const _handleFlipCamera = () => {
    // Rotation animation
    Animated.sequence([
      Animated.timing(flipRotateAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(flipRotateAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    setCameraPosition(prev => prev === 'back' ? 'front' : 'back');
  };

  // Get button styles based on recording state
  const getRecordButtonStyle = () => {
    return {
      backgroundColor: isRecording ? '#ff4b89' : '#00f0ff',
      transform: [{ scale: recordScaleAnim }],
    };
  };
  
  const getInnerButtonStyle = () => {
    return {
      transform: [{ scale: innerScaleAnim }],
      borderRadius: innerScaleAnim.interpolate({
        inputRange: [0.5, 1],
        outputRange: [8, 40],
      }),
    };
  };
  
  const getRingStyle = () => {
    return {
      transform: [{ scale: ringScaleAnim }],
      borderColor: isRecording ? '#ff4b89' : 'rgba(0, 240, 255, 0.3)',
    };
  };
  
  const getFlipStyle = () => {
    return {
      transform: [{
        rotate: flipRotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      }],
    };
  };
  
  const getProgressBarWidth = () => {
    return progressAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Camera Preview Background */}
      {device ? (
        <Camera
          style={styles.cameraPreview}
          device={device}
          isActive={true}
          photo={selectedMode === 'PHOTO'}
          video={selectedMode === 'VIDEO'}
          audio={true}
        />
      ) : (
        <View style={styles.cameraPreview}>
          <Image 
            source={{ uri: cameraAssets.fallback }}
            style={styles.fallbackImage}
            resizeMode="cover"
          />
        </View>
      )}
      
      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(19,19,19,0.4)', 'transparent', 'rgba(19,19,19,0.6)']}
        style={styles.gradientOverlay}
      />
      
      {/* Recording Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, { width: getProgressBarWidth() }]} />
      </View>
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerButton}>
          <Text style={styles.headerIcon}>✕</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Pressable style={styles.soundButton}>
            <Text style={styles.soundIcon}>🎵</Text>
            <Text style={styles.soundText}>Add Sound</Text>
          </Pressable>
        </View>
        <Pressable style={styles.headerButton}>
          <Text style={styles.headerIcon}>⚙️</Text>
        </Pressable>
      </View>
      
      {/* Right Sidebar Toolbar */}
      <View style={styles.sidebar}>
        <View style={styles.sidebarItem}>
          <Pressable style={styles.sidebarButton}>
            <Text style={styles.sidebarIcon}>✨</Text>
          </Pressable>
          <Text style={styles.sidebarLabel}>Beauty</Text>
        </View>
        <View style={styles.sidebarItem}>
          <Pressable style={styles.sidebarButton}>
            <Text style={styles.sidebarIcon}>🌸</Text>
          </Pressable>
          <Text style={styles.sidebarLabel}>Filters</Text>
        </View>
        <View style={styles.sidebarItem}>
          <Pressable style={styles.sidebarButton}>
            <Text style={styles.sidebarIcon}>⏱️</Text>
          </Pressable>
          <Text style={styles.sidebarLabel}>Timer</Text>
        </View>
        <View style={styles.sidebarItem}>
          <Pressable style={styles.sidebarButton}>
            <Text style={styles.sidebarIcon}>⚡</Text>
          </Pressable>
          <Text style={styles.sidebarLabel}>Speed</Text>
        </View>
        <View style={styles.sidebarItem}>
          <Pressable style={styles.sidebarButton}>
            <Text style={styles.sidebarIcon}>🔦</Text>
          </Pressable>
          <Text style={styles.sidebarLabel}>Flash</Text>
        </View>
        <Pressable style={styles.sidebarExpand}>
          <Text style={styles.sidebarIcon}>⋮</Text>
        </Pressable>
      </View>
      
      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <View style={styles.bottomLeft}>
          <Pressable style={styles.uploadButton}>
            <Image 
              source={{ uri: cameraAssets.uploadPreview }}
              style={styles.uploadPreview}
            />
          </Pressable>
          <Text style={styles.bottomLabel}>Upload</Text>
        </View>
        
        {/* Record Button */}
        <Animated.View style={[styles.recordRing, getRingStyle()]}>
          <Animated.View style={[styles.recordButton, getRecordButtonStyle()]}>
            <Animated.View style={[styles.recordInner, getInnerButtonStyle()]} />
          </Animated.View>
        </Animated.View>
        
        <View style={styles.bottomRight}>
          <Animated.View style={getFlipStyle()}>
            {/* <Pressable style={styles.flipButton} onPress={handleFlipCamera}>
              <Text style={styles.flipIcon}>🔄</Text>
            </Pressable>*/}
          </Animated.View>
          <Text style={styles.bottomLabel}>Flip</Text>
        </View>
      </View>
      
      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <Pressable onPress={() => setSelectedMode('VIDEO')}>
          <Text style={[styles.modeText, selectedMode === 'VIDEO' && styles.modeTextActive]}>
            VIDEO
          </Text>
        </Pressable>
        <Pressable onPress={() => { setSelectedMode('PHOTO'); onOpenEditor?.(); }}>
          <Text style={[styles.modeText, selectedMode === 'PHOTO' && styles.modeTextActive]}>
            PHOTO
          </Text>
        </Pressable>
        <Pressable onPress={() => { setSelectedMode('LIVE'); onOpenEditor?.(); }}>
          <Text style={[styles.modeText, selectedMode === 'LIVE' && styles.modeTextActive]}>
            LIVE
          </Text>
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
  cameraPreview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fallbackImage: {
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
  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00f0ff',
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
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
    color: '#e2e2e2',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  soundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(19, 19, 19, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  soundIcon: {
    fontSize: 18,
    color: '#00f0ff',
  },
  soundText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#e2e2e2',
  },
  sidebar: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -150 }],
    alignItems: 'center',
    gap: 24,
    zIndex: 10,
  },
  sidebarItem: {
    alignItems: 'center',
    gap: 4,
  },
  sidebarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(19, 19, 19, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarIcon: {
    fontSize: 24,
    color: '#e2e2e2',
  },
  sidebarLabel: {
    fontSize: 10,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#e2e2e2',
    opacity: 0.8,
  },
  sidebarExpand: {
    marginTop: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(19, 19, 19, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 24,
    zIndex: 10,
  },
  bottomLeft: {
    alignItems: 'center',
    gap: 8,
  },
  uploadButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  uploadPreview: {
    width: '100%',
    height: '100%',
  },
  bottomLabel: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: '#e2e2e2',
  },
  recordRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#131313',
  },
  bottomRight: {
    alignItems: 'center',
    gap: 8,
  },
  flipButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(19, 19, 19, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipIcon: {
    fontSize: 28,
    color: '#e2e2e2',
  },
  modeSelector: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    zIndex: 10,
  },
  modeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: 'rgba(185, 202, 203, 0.4)',
  },
  modeTextActive: {
    color: '#00f0ff',
    textShadowColor: 'rgba(0, 219, 233, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
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
  navIconCreate: {
    fontSize: 36,
    color: '#00f0ff',
    textShadowColor: 'rgba(0, 219, 233, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});

export default CameraScreen;