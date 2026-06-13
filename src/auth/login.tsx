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
} from 'react-native';


const { width } = Dimensions.get('window');
const isSmallScreen = width < 380;

interface LoginScreenProps {
  onLoginSuccess?: (email: string, password: string) => void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  onSocialLogin?: (provider: 'google' | 'apple' | 'facebook') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onForgotPassword,
  onSignUp,
  onSocialLogin,
}) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const buttonGlowAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Button glow animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonGlowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(buttonGlowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [buttonGlowAnim, fadeAnim]);

  // Handle login submission
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    
    // Button scale animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }),
    ]).start();

    try {
      await onLoginSuccess?.(email, password);
    } catch (error) {
      // Error is handled in App.tsx via Alert
    } finally {
      setIsLoading(false);
    }
  };

  // Handle touch for background effect
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Get button glow style
  const buttonGlowStyle = {
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: buttonGlowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.6],
    }),
    shadowRadius: buttonGlowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [10, 20],
    }),
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Background gradient effect */}
          <View style={styles.backgroundGradients}>
            <View style={[styles.gradientBlob, styles.gradientBlobTop]} />
            <View style={[styles.gradientBlob, styles.gradientBlobBottom]} />
          </View>

          {/* Main content */}
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Logo & Title */}
            <View style={styles.header}>
              <Text style={styles.title}>DIGITAL PULSE</Text>
              <Text style={styles.subtitle}>Welcome to the Future</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Email Input */}
              <View style={styles.glassInput}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="rgba(185, 202, 203, 0.4)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password Input */}
              <View style={styles.glassInput}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(185, 202, 203, 0.4)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={togglePasswordVisibility} style={styles.visibilityButton}>
                  <Text style={styles.visibilityIcon}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </Pressable>
              </View>

              {/* Forgot Password Link */}
              <View style={styles.forgotPasswordContainer}>
                <Pressable onPress={onForgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </Pressable>
              </View>

              {/* Login Button */}
              <Animated.View style={[styles.buttonContainer, buttonGlowStyle]}>
                <Pressable
                  style={styles.loginButton}
                  onPress={handleLogin}
                  disabled={isLoading}

                >
                  {isLoading ? (
                    <Text style={styles.loginButtonText}>Logging in...</Text>
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Login</Text>
                    </>
                  )}
                </Pressable>
              </Animated.View>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Logins */}
            <View style={styles.socialSection}>
              <Pressable
                style={styles.socialButton}
                onPress={() => onSocialLogin?.('google')}
              >
                <Text style={styles.socialIcon}>G</Text>
              </Pressable>
              <Pressable
                style={styles.socialButton}
                onPress={() => onSocialLogin?.('apple')}
              >
                <Text style={styles.socialIcon}></Text>
              </Pressable>
              <Pressable
                style={styles.socialButton}
                onPress={() => onSocialLogin?.('facebook')}
              >
                <Text style={styles.socialIcon}>f</Text>
              </Pressable>
            </View>

            {/* Footer Links */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don't have an account?{' '}
                <Text style={styles.signUpLink} onPress={onSignUp}>
                  Sign Up
                </Text>
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  backgroundGradients: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  gradientBlob: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    opacity: 0.15,
  },
  gradientBlobTop: {
    top: -width * 0.3,
    left: -width * 0.3,
    backgroundColor: '#00f0ff',
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 120,
    elevation: 5,
  },
  gradientBlobBottom: {
    bottom: -width * 0.3,
    right: -width * 0.3,
    backgroundColor: '#ff4b89',
    shadowColor: '#ff4b89',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 120,
    elevation: 5,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: isSmallScreen ? 28 : 32,
    fontWeight: '800',
    lineHeight: isSmallScreen ? 36 : 40,
    letterSpacing: -0.02,
    color: '#00f0ff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(185, 202, 203, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
  },
  formSection: {
    gap: 16,
  },
  glassInput: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputIcon: {
    fontSize: 20,
    color: 'rgba(0, 240, 255, 0.6)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#e2e2e2',
    padding: 0,
    margin: 0,
  },
  visibilityButton: {
    padding: 4,
  },
  visibilityIcon: {
    fontSize: 20,
    color: 'rgba(185, 202, 203, 0.6)',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  forgotPasswordText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#7df4ff',
  },
  buttonContainer: {
    marginTop: 8,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    backgroundColor: '#00f0ff',
    borderRadius: 12,
  },
  loginButtonText: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.01,
    color: '#00363a',
  },
  loginButtonIcon: {
    fontSize: 20,
    color: '#00363a',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: 'rgba(185, 202, 203, 0.4)',
  },
  socialSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 64,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    fontSize: 24,
    color: 'rgba(226, 226, 226, 0.8)',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(185, 202, 203, 0.6)',
  },
  signUpLink: {
    color: '#ffb1c3',
    fontWeight: 'bold',
  },
});

export default LoginScreen;