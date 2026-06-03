import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import { BottomNavigationBar, TabType } from './src/navigation/navigation-bar';

export type AppTabType = TabType | 'live' | 'video-edit';
export type AuthScreenType = 'signup' | 'login' | 'forget-password' | 'verification-code';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 380;

// Types
interface SplashScreenProps {
  onLoadingComplete?: () => void;
  minimumLoadTime?: number; // Temps minimum d'affichage en ms
}

// Loading phrases array
const LOADING_PHRASES = [
  "Initializing core...",
  "Syncing neural link...",
  "Optimizing feed...",
  "Decrypting assets...",
  "Establishing connection...",
  "Ready to create."
];

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onLoadingComplete,
  minimumLoadTime = 2000,
}) => {
  // State
  const [currentPhrase, setCurrentPhrase] = useState(LOADING_PHRASES[0]);
  const currentPhraseRef = useRef(LOADING_PHRASES[0]);
  const [isComplete, setIsComplete] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(1)).current;
  
  // Timer refs
  const progressInterval = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTime = useRef(Date.now());

  // Rotation animation for spinner
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinAnim]);

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ])
      ),
    ]).start();
  }, [fadeAnim, glowAnim, scaleAnim]);

  // Progress bar simulation
  useEffect(() => {
    let currentProgress = 0;
    
    const updateProgress = () => {
      if (currentProgress < 100 && !isComplete) {
        // Random incremental jumps for realistic feel (3-12%)
        const increment = Math.random() * 9 + 3;
        currentProgress = Math.min(currentProgress + increment, 100);
        
        // Animate progress bar
        Animated.timing(progressAnim, {
          toValue: currentProgress,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
        
        // Update text based on progress
        const targetPhraseIndex = Math.floor((currentProgress / 100) * (LOADING_PHRASES.length - 1));
        const currentPhraseIndex = LOADING_PHRASES.indexOf(currentPhraseRef.current);
        
        if (targetPhraseIndex !== currentPhraseIndex && targetPhraseIndex < LOADING_PHRASES.length) {
          // Fade out text
          Animated.timing(textOpacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            const nextPhrase = LOADING_PHRASES[targetPhraseIndex];
            currentPhraseRef.current = nextPhrase;
            setCurrentPhrase(nextPhrase);
            // Fade in new text
            Animated.timing(textOpacityAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }).start();
          });
        }
        
        // Schedule next update with random delay
        const nextDelay = Math.random() * 400 + 100;
        progressInterval.current = setTimeout(updateProgress, nextDelay);
      } else if (currentProgress >= 100 && !isComplete) {
        // Loading complete
        setIsComplete(true);
        
        const elapsedTime = Date.now() - startTime.current;
        const remainingTime = Math.max(0, minimumLoadTime - elapsedTime);
        
        // Wait for minimum load time then fade out
        setTimeout(() => {
          Animated.timing(contentFadeAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start(() => {
            onLoadingComplete?.();
          });
        }, remainingTime);
      }
    };
    
    updateProgress();
    
    return () => {
      if (progressInterval.current) {
        clearTimeout(progressInterval.current);
      }
    };
  }, [contentFadeAnim, isComplete, minimumLoadTime, onLoadingComplete, progressAnim, textOpacityAnim]);

  // Get logo glow style
  const logoGlowStyle = {
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.15, 0.35],
    }),
    shadowRadius: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 30],
    }),
    elevation: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [5, 15],
    }),
  };

  // Get progress bar width
  const progressBarWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // Get spinner rotation
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#131313" translucent />
      
      {/* Cinematic Background */}
      <View style={styles.backgroundContainer}>
        <View style={styles.gradientOverlay} />
        <View style={styles.scanlineOverlay} />
      </View>
      
      {/* Main Content */}
      <Animated.View
        style={[
          styles.mainContent,
          {
            opacity: contentFadeAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.centerContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Animated.View style={[styles.logoGlow, logoGlowStyle]}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoIcon}>⚡</Text>
              </View>
            </Animated.View>
            
            {/* Brand Name */}
            <View style={styles.brandContainer}>
              <Text style={styles.brandTitle}>DIGITAL PULSE</Text>
              <Text style={styles.brandSubtitle}>Future of Creation</Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Loading Indicator Section */}
        <View style={styles.loadingSection}>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                { width: progressBarWidth },
              ]}
            />
          </View>
          
          <View style={styles.loadingTextContainer}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Text style={styles.spinnerIcon}>⚡</Text>
            </Animated.View>
            <Animated.Text
              style={[
                styles.loadingText,
                { opacity: textOpacityAnim },
              ]}
            >
              {currentPhrase}
            </Animated.Text>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>v2.4.0-alpha // secured connection</Text>
        </View>
      </Animated.View>
      
      {/* Mouse Glow Effect (simulated with touch for mobile) */}
      <View style={styles.glowOverlay} pointerEvents="none" />
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
    overflow: 'hidden',
  },
  scanlineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    opacity: 0.3,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#131313',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoGlow: {
    position: 'relative',
  },
  logoContainer: {
    width: isSmallScreen ? 88 : 96,
    height: isSmallScreen ? 88 : 96,
    borderRadius: isSmallScreen ? 20 : 24,
    backgroundColor: 'rgba(42, 42, 42, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 48,
    color: '#00f0ff',
    textShadowColor: 'rgba(0, 219, 233, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  brandTitle: {
    fontSize: isSmallScreen ? 40 : 48,
    fontWeight: '800',
    lineHeight: isSmallScreen ? 48 : 56,
    letterSpacing: -0.04,
    color: '#00f0ff',
    textShadowColor: 'rgba(0, 219, 233, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  brandSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 3.6,
    textTransform: 'uppercase',
    color: '#ffb1c3',
    opacity: 0.8,
    marginTop: 8,
  },
  loadingSection: {
    position: 'absolute',
    bottom: isSmallScreen ? 80 : 96,
    width: width - 80,
    maxWidth: 280,
    alignItems: 'center',
    gap: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00f0ff',
    borderRadius: 1,
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  loadingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spinnerIcon: {
    fontSize: 16,
    color: '#00f0ff',
  },
  loadingText: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(185, 202, 203, 0.7)',
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: 'rgba(185, 202, 203, 0.3)',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#131313',
  },
  touchContainer: {
    flex: 1,
  },
  touchGlow: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    pointerEvents: 'none',
  },
});

// Version avec gestion du toucher pour l'effet de glow
export const TouchSplashScreen: React.FC<SplashScreenProps> = (props) => {
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const [showGlow, setShowGlow] = useState(false);
  
  const handleTouchMove = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    setTouchPosition({ x: locationX, y: locationY });
    setShowGlow(true);
    
    // Hide glow after 1 second of no movement
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowGlow(false);
    }, 1000);
  };
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  return (
    <View 
      style={styles.touchContainer}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchMove}
    >
      <SplashScreen {...props} />
      {showGlow && (
        <View
          style={[
            styles.touchGlow,
            {
              top: touchPosition.y - 300,
              left: touchPosition.x - 300,
            },
          ]}
        />
      )}
    </View>
  );
};

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTabType>('home');
  const [authScreen, setAuthScreen] = useState<AuthScreenType>('signup');

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setActiveTab('home');
  };

  const renderAuthScreen = () => {
    switch (authScreen) {
      case 'login': {
        const mod = require('./src/auth/login');
        const LoginScreen = mod.LoginScreen ?? mod.default;
        return (
          <LoginScreen
            onLoginSuccess={handleAuthSuccess}
            onForgotPassword={() => setAuthScreen('forget-password')}
            onSignUp={() => setAuthScreen('signup')}
          />
        );
      }
      case 'forget-password': {
        const mod = require('./src/auth/forget-password');
        const ResetPasswordScreen = mod.ResetPasswordScreen ?? mod.default;
        return (
          <ResetPasswordScreen
            onBackToLogin={() => setAuthScreen('login')}
            onResetSuccess={() => setAuthScreen('login')}
          />
        );
      }
      case 'verification-code': {
        const mod = require('./src/auth/verification-code');
        const OTPScreen = mod.OTPScreen ?? mod.default;
        return (
          <OTPScreen
            onVerify={async () => true}
            onResendCode={async () => true}
            onBack={() => setAuthScreen('login')}
            onSuccess={handleAuthSuccess}
          />
        );
      }
      case 'signup':
      default: {
        const mod = require('./src/auth/sign-up');
        const SignUpScreen = mod.SignUpScreen ?? mod.default;
        return (
          <SignUpScreen
            onLogin={() => setAuthScreen('login')}
            onSignUpSuccess={handleAuthSuccess}
          />
        );
      }
    }
  };

  const renderCurrentScreen = () => {
    const handleLivePress = () => setActiveTab('live');

    switch (activeTab) {
      case 'live':
        {
          const mod = require('./src/screen/live');
          const LiveStreamScreen = mod.LiveStreamScreen ?? mod.default;
          return (
            <LiveStreamScreen 
              onBackPress={() => setActiveTab('home')}
            />
          );
        }
      case 'discover':
        // Import dynamically to avoid circular dependencies
        {
          const mod = require('./src/screen/discover');
          const DiscoverScreen = mod.DiscoverScreen ?? mod.default;
          return <DiscoverScreen onLivePress={handleLivePress} />;
        }
      case 'create':
        {
          const mod = require('./src/screen/video-record');
          const CameraScreen = mod.CameraScreen ?? mod.default;
          return <CameraScreen onOpenEditor={() => setActiveTab('video-edit')} />;
        }
      case 'video-edit':
        {
          const mod = require('./src/screen/video-edit');
          const VideoEditorScreen = mod.VideoEditorScreen ?? mod.default;
          return <VideoEditorScreen />;
        }
      case 'inbox':
        {
          const mod = require('./src/screen/notifications');
          const InboxScreen = mod.InboxScreen ?? mod.default;
          return <InboxScreen onLivePress={handleLivePress} />;
        }
      case 'profile':
        {
          const mod = require('./src/screen/profile');
          const ProfileScreen = mod.ProfileScreen ?? mod.default;
          return <ProfileScreen onLivePress={handleLivePress} />;
        }
      case 'home':
      default:
        {
          const mod = require('./src/screen/home');
          const HomeScreen = mod.HomeScreen ?? mod.default;
          return <HomeScreen onLivePress={handleLivePress} />;
        }
    }
  };

  if (!isLoaded) {
    return <SplashScreen onLoadingComplete={() => setIsLoaded(true)} />;
  }

  if (!isAuthenticated) {
    return <View style={styles.appContainer}>{renderAuthScreen()}</View>;
  }

  return (
    <View style={styles.appContainer}>
      {renderCurrentScreen()}
      {activeTab !== 'live' && activeTab !== 'video-edit' && (
        <BottomNavigationBar activeTab={activeTab as TabType} onTabPress={setActiveTab} />
      )}
    </View>
  );
};

export default App;