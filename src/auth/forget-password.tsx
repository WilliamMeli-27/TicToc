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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 380;

// Types
interface ResetPasswordScreenProps {
  onSendResetLink?: (email: string) => Promise<boolean>;
  onBackToLogin?: () => void;
  onResetSuccess?: () => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  onSendResetLink,
  onBackToLogin,
  onResetSuccess,
}) => {
  // Form state
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkSent, setIsLinkSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(20)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Validation des couleurs pour le glow
  const primaryColor = '#00f0ff';
  const secondaryColor = '#ff4b89';

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Button glow animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Validate email format
  const validateEmail = (emailText: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailText) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(emailText)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Handle email change
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      validateEmail(text);
    }
  };

  // Show toast notification
  const showToast = () => {
    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 3000);
  };

  // Handle form submission
  const handleSendResetLink = async () => {
    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    setIsLinkSent(false);

    // Button scale animation
    Animated.sequence([
      Animated.spring(buttonScaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.spring(buttonScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }),
    ]).start();

    try {
      let success = false;
      
      if (onSendResetLink) {
        success = await onSendResetLink(email);
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        success = true;
      }

      if (success) {
        setIsLinkSent(true);
        showToast();
        
        // Auto navigate after success
        setTimeout(() => {
          onResetSuccess?.();
        }, 3000);
      } else {
        Alert.alert('Error', 'Failed to send reset link. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get button glow style
  const buttonGlowStyle = {
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.5],
    }),
    shadowRadius: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 25],
    }),
    elevation: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [5, 10],
    }),
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#131313" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Background Atmospheric Elements */}
          <View style={styles.backgroundElements}>
            <View style={styles.gridPattern} />
            <View style={[styles.gradientBlob, styles.gradientBlobTop]} />
            <View style={[styles.gradientBlob, styles.gradientBlobBottom]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoIconText}>⚡</Text>
              </View>
              <Text style={styles.logoText}>Digital Pulse</Text>
            </View>
          </View>

          {/* Main Content */}
          <Animated.View
            style={[
              styles.mainContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Hero Image Placeholder */}
            <View style={styles.heroContainer}>
              <View style={styles.heroGlow} />
              <View style={styles.heroImage}>
                <Text style={styles.heroIcon}>🔒</Text>
              </View>
            </View>

            {/* Instructions Section */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.title}>Forgot Password</Text>
              <Text style={styles.subtitle}>
                No worries! Enter your email to reset your access to the Digital Pulse ecosystem.
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={[styles.inputContainer, emailError && styles.inputContainerError]}>
                  <Text style={styles.inputIcon}>✉️</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    placeholderTextColor="rgba(185, 202, 203, 0.4)"
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : (
                  <Text style={styles.helperText}>We'll send a reset link to this email</Text>
                )}
              </View>

              {/* Submit Button */}
              <Animated.View style={[buttonGlowStyle]}>
                <Pressable
                  style={[
                    styles.submitButton,
                    isLoading && styles.submitButtonDisabled,
                    isLinkSent && styles.submitButtonSuccess,
                  ]}
                  onPress={handleSendResetLink}
                  disabled={isLoading || isLinkSent}

                >
                  {isLoading ? (
                    <>
                      <Text style={styles.submitButtonText}>Sending...</Text>
                      <Text style={styles.submitButtonIcon}>🔄</Text>
                    </>
                  ) : isLinkSent ? (
                    <>
                      <Text style={styles.submitButtonText}>Link Sent!</Text>
                      <Text style={styles.submitButtonIcon}>✓</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Send Reset Link</Text>
                    </>
                  )}
                </Pressable>
              </Animated.View>
            </View>

            {/* Footer Links */}
            <View style={styles.footer}>
              <Pressable
                style={styles.backButton}
                onPress={onBackToLogin}
                disabled={isLoading}
              >
                <Text style={styles.backButtonText}>Back to Login</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Notification Toast */}
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: toastOpacity,
            transform: [{ translateY: toastTranslateY }],
          },
        ]}
      >
        <Text style={styles.toastText}>Link sent! Check your inbox.</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: 'transparent',
  },
  gradientBlob: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    opacity: 0.08,
  },
  gradientBlobTop: {
    top: -width * 0.3,
    right: -width * 0.3,
    backgroundColor: '#00f0ff',
  },
  gradientBlobBottom: {
    bottom: -width * 0.3,
    left: -width * 0.3,
    backgroundColor: '#ff4b89',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    zIndex: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#00f0ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconText: {
    fontSize: 18,
    color: '#00363a',
    fontWeight: 'bold',
  },
  logoText: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: '800',
    letterSpacing: -0.02,
    color: '#00f0ff',
  },
  mainContent: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    zIndex: 5,
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroGlow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  heroImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroIcon: {
    fontSize: 48,
  },
  instructionsContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: isSmallScreen ? 28 : 32,
    fontWeight: '700',
    lineHeight: isSmallScreen ? 36 : 40,
    letterSpacing: -0.02,
    color: '#e2e2e2',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(185, 202, 203, 0.8)',
    textAlign: 'center',
    maxWidth: 300,
  },
  formContainer: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#00f0ff',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: 'rgba(42, 42, 42, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputContainerError: {
    borderColor: '#ffb4ab',
    borderWidth: 1,
  },
  inputIcon: {
    fontSize: 20,
    color: 'rgba(185, 202, 203, 0.6)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#e2e2e2',
    padding: 0,
    margin: 0,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#ffb4ab',
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(185, 202, 203, 0.5)',
    marginLeft: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    backgroundColor: '#00f0ff',
    borderRadius: 999,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonSuccess: {
    backgroundColor: '#a2ef00',
  },
  submitButtonText: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.01,
    color: '#00363a',
  },
  submitButtonIcon: {
    fontSize: 20,
    color: '#00363a',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backButtonIcon: {
    fontSize: 18,
    color: 'rgba(185, 202, 203, 0.7)',
  },
  backButtonText: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(185, 202, 203, 0.7)',
  },
  toast: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(31, 31, 31, 0.95)',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  toastIcon: {
    fontSize: 20,
    color: '#00f0ff',
  },
  toastText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#e2e2e2',
  },
});

export default ResetPasswordScreen;