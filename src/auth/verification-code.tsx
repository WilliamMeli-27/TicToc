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
  StatusBar,
  Alert,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 380;

// Types
interface OTPScreenProps {
  email?: string;
  phoneNumber?: string;
  onVerify: (otp: string) => Promise<boolean>;
  onResendCode: () => Promise<boolean>;
  onBack: () => void;
  onSuccess?: () => void;
}

export const OTPScreen: React.FC<OTPScreenProps> = ({
  email,
  phoneNumber,
  onVerify,
  onResendCode,
  onBack,
  onSuccess,
}) => {
  // OTP state
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(59);
  const [canResend, setCanResend] = useState(false);
  
  // Refs for OTP inputs
  const inputRefs = useRef<(TextInput | null)[]>([]);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !canResend) {
      setCanResend(true);
    }
  }, [timeLeft, canResend]);

  // Entrance animation
  useEffect(() => {
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

    // Button glow animation
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

    // Auto focus on first input
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  // Handle OTP input change
  const handleOtpChange = (text: string, index: number) => {
    // Only allow single digit
    const value = text.replace(/[^0-9]/g, '');
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value.length === 1 && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace key
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle verify OTP
  const handleVerify = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 4) {
      Alert.alert('Incomplete Code', 'Please enter the 4-digit verification code');
      return;
    }
    
    setIsLoading(true);
    
    // Button animation
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
      const success = await onVerify(otpString);
      
      if (success) {
        onSuccess?.();
      } else {
        Alert.alert('Verification Failed', 'Invalid code. Please try again.');
        // Clear OTP inputs
        setOtp(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend code
  const handleResend = async () => {
    if (!canResend) return;
    
    setIsResending(true);
    
    try {
      const success = await onResendCode();
      
      if (success) {
        setTimeLeft(59);
        setCanResend(false);
        setOtp(['', '', '', '']);
        inputRefs.current[0]?.focus();
        Alert.alert('Code Sent', 'A new verification code has been sent to your device');
      } else {
        Alert.alert('Error', 'Failed to resend code. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Get button glow style
  const buttonGlowStyle = {
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.2, 0.4],
    }),
    shadowRadius: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [10, 20],
    }),
    elevation: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [3, 8],
    }),
  };

  // Get OTP input focus animation
  const getOtpInputStyle = (index: number) => {
    return {
      ...styles.otpInput,
      borderColor: otp[index] ? '#00dbe9' : 'rgba(59, 73, 75, 0.5)',
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#131313" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.logoText}>Digital Pulse</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Background Elements */}
        <View style={styles.backgroundElements}>
          <View style={styles.gradientBlobTop} />
          <View style={styles.gradientBlobBottom} />
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
          {/* Header Text */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Verify Identity</Text>
            <Text style={styles.subtitle}>
              We've sent a 4-digit code to{' '}
              {email || phoneNumber || 'your device'}
            </Text>
          </View>

          {/* OTP Input Grid */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={getOtpInputStyle(index)}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                placeholder="•"
                placeholderTextColor="rgba(185, 202, 203, 0.3)"
                editable={!isLoading}
              />
            ))}
          </View>

          {/* Timer and Resend */}
          <View style={styles.timerContainer}>
            <View style={styles.timerRow}>
              <Text style={styles.timerIcon}>⏰</Text>
              <Text style={styles.timerText}>
                Resend in {formatTime(timeLeft)}
              </Text>
            </View>
            <Pressable
              onPress={handleResend}
              disabled={!canResend || isResending}
            >
              <Text
                style={[
                  styles.resendText,
                  !canResend && styles.resendTextDisabled,
                  isResending && styles.resendTextLoading,
                ]}
              >
                {isResending ? 'Sending...' : "Didn't receive the code? Resend"}
              </Text>
            </Pressable>
          </View>

          {/* Verify Button */}
          <Animated.View style={[buttonGlowStyle]}>
            <Pressable
              style={[
                styles.verifyButton,
                isLoading && styles.verifyButtonDisabled,
              ]}
              onPress={handleVerify}
              disabled={isLoading}

            >
              {isLoading ? (
                <>
                  <Text style={styles.verifyButtonText}>Verifying...</Text>
                  <Text style={styles.verifyButtonIcon}>🔄</Text>
                </>
              ) : (
                <>
                  <Text style={styles.verifyButtonText}>Verify</Text>
                  <Text style={styles.verifyButtonIcon}>✓</Text>
                </>
              )}
            </Pressable>
          </Animated.View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDots}>
            <View style={styles.footerDot} />
            <View style={styles.footerDot} />
            <View style={[styles.footerDot, styles.footerDotActive]} />
            <View style={styles.footerDot} />
          </View>
          <Text style={styles.footerText}>SECURED BY PULSE ID</Text>
        </View>
      </KeyboardAvoidingView>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(19, 19, 19, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#e2e2e2',
  },
  logoText: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: '800',
    letterSpacing: -0.02,
    color: '#00f0ff',
  },
  headerSpacer: {
    width: 40,
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  gradientBlobTop: {
    position: 'absolute',
    top: height * 0.2,
    left: -width * 0.3,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    opacity: 0.5,
  },
  gradientBlobBottom: {
    position: 'absolute',
    bottom: height * 0.2,
    right: -width * 0.3,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(255, 75, 137, 0.1)',
    opacity: 0.5,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  textContainer: {
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
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  otpInput: {
    width: isSmallScreen ? 60 : 70,
    height: isSmallScreen ? 75 : 85,
    backgroundColor: 'rgba(42, 42, 42, 0.6)',
    borderWidth: 2,
    borderRadius: 12,
    fontSize: isSmallScreen ? 40 : 48,
    fontWeight: '800',
    color: '#e2e2e2',
    textAlign: 'center',
    padding: 0,
    includeFontPadding: false,
  },
  timerContainer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerIcon: {
    fontSize: 14,
    color: '#7df4ff',
  },
  timerText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#7df4ff',
  },
  resendText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#7df4ff',
  },
  resendTextDisabled: {
    color: 'rgba(185, 202, 203, 0.4)',
  },
  resendTextLoading: {
    opacity: 0.5,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 56,
    backgroundColor: '#00f0ff',
    borderRadius: 12,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.01,
    color: '#00363a',
  },
  verifyButtonIcon: {
    fontSize: 20,
    color: '#00363a',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
    gap: 8,
  },
  footerDots: {
    flexDirection: 'row',
    gap: 4,
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
  },
  footerDotActive: {
    width: 48,
    backgroundColor: '#00f0ff',
  },
  footerText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: 'rgba(185, 202, 203, 0.4)',
  },
});

export default OTPScreen;