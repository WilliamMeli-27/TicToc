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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 380;

const STRENGTH_COLOR_STYLES = [
  { backgroundColor: '#FFB4AB', shadowColor: 'rgba(255, 180, 171, 0.4)' },
  { backgroundColor: '#FF4B89', shadowColor: 'rgba(255, 75, 137, 0.4)' },
  { backgroundColor: '#A2EF00', shadowColor: 'rgba(162, 239, 0, 0.4)' },
  { backgroundColor: '#00F0FF', shadowColor: 'rgba(0, 240, 255, 0.4)' },
];

interface StrengthConfig {
  color: string;
  text: string;
  shadowColor: string;
}

interface SignUpScreenProps {
  onLogin?: () => void;
  onSignUpSuccess?: (email: string, password: string, username: string, fullName: string) => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({ onLogin, onSignUpSuccess }) => {
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthText, setStrengthText] = useState('Enter a strong password');
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Password strength configuration
  const strengthConfig: StrengthConfig[] = [
    { color: '#FFB4AB', text: 'Too Weak', shadowColor: 'rgba(255, 180, 171, 0.4)' },
    { color: '#FF4B89', text: 'Fairly Weak', shadowColor: 'rgba(255, 75, 137, 0.4)' },
    { color: '#A2EF00', text: 'Good Strength', shadowColor: 'rgba(162, 239, 0, 0.4)' },
    { color: '#00F0FF', text: 'Pulse Level Strong', shadowColor: 'rgba(0, 240, 255, 0.4)' },
  ];

  // Password strength calculation
  const calculateStrength = (pass: string): number => {
    let score = 0;
    if (pass.length > 5) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  // Handle password change
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    const score = calculateStrength(text);
    setPasswordStrength(score);
    
    if (text.length === 0) {
      setStrengthText('Enter a strong password');
    } else {
      setStrengthText(strengthConfig[score - 1]?.text || 'Too Short');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!email || !password || !username || !fullName) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    
    // Button animation
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
      await onSignUpSuccess?.(email, password, username, fullName);
    } catch (error) {
      // Error handled in App.tsx
    } finally {
      setIsLoading(false);
    }
  };

  // Render strength meter segments
  const renderStrengthSegments = () => {
    const segments = [];
    for (let i = 0; i < 4; i++) {
      const isActive = i < passwordStrength;
      const activeSegmentStyle = passwordStrength > 0 ? STRENGTH_COLOR_STYLES[passwordStrength - 1] : undefined;

      segments.push(
        <View
          key={i}
          style={[
            styles.strengthSegment,
            isActive ? activeSegmentStyle : styles.strengthSegmentInactive,
          ]}
        />
      );
    }
    return segments;
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
          <View style={styles.glassCard}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                Join Pulse
              </Text>
              <Text style={styles.subtitle}>
                Create your creator identity.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Full Name Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Alex Rivera"
                    placeholderTextColor="rgba(185, 202, 203, 0.3)"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              {/* Email Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>@</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="alex@pulse.digital"
                    placeholderTextColor="rgba(185, 202, 203, 0.3)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Username Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>@</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="alex_codes"
                    placeholderTextColor="rgba(185, 202, 203, 0.3)"
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="rgba(185, 202, 203, 0.3)"
                    secureTextEntry
                    value={password}
                    onChangeText={handlePasswordChange}
                  />
                </View>
                
                {/* Strength Meter */}
                <View style={styles.strengthMeter}>
                  {renderStrengthSegments()}
                </View>
                <Text style={styles.strengthText}>{strengthText}</Text>
              </View>

              {/* Submit Button */}
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Pressable
                  style={[
                    styles.submitButton,
                    isLoading && styles.submitButtonLoading,
                  ]}
                  onPress={handleSubmit}
                  disabled={isLoading}

                >
                  {isLoading ? (
                    <>
                      <Text style={styles.submitButtonText}>Syncing...</Text>
                      <Text style={styles.submitIcon}>🔄</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Create Account</Text>
                    </>
                  )}
                </Pressable>
              </Animated.View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text style={styles.footerLink} onPress={onLogin}>Log In</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles
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
    padding: 16,
  },
  glassCard: {
    backgroundColor: 'rgba(27, 27, 27, 0.4)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    borderLeftColor: 'rgba(255, 255, 255, 0.15)',
    padding: isSmallScreen ? 32 : 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 8,
  },
  title: {
    fontSize: isSmallScreen ? 40 : 48,
    fontWeight: '800',
    lineHeight: isSmallScreen ? 48 : 56,
    letterSpacing: -0.04,
    color: '#00F0FF',
    textShadowColor: 'rgba(0, 240, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(185, 202, 203, 0.8)',
    textAlign: 'center',
  },
  form: {
    gap: 24,
    marginBottom: 32,
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
    color: 'rgba(185, 202, 203, 0.8)',
    paddingHorizontal: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B1B1B',
    borderWidth: 1,
    borderColor: 'rgba(59, 73, 75, 0.3)',
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
    color: 'rgba(185, 202, 203, 0.7)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#E2E2E2',
    padding: 0,
    margin: 0,
  },
  strengthMeter: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  strengthSegmentInactive: {
    backgroundColor: 'rgba(59, 73, 75, 0.3)',
  },
  strengthText: {
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(185, 202, 203, 0.5)',
    paddingHorizontal: 4,
    marginTop: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00F0FF',
    paddingVertical: 16,
    borderRadius: 999,
    marginTop: 16,
    shadowColor: 'rgba(0, 240, 255, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 5,
  },
  submitButtonLoading: {
    opacity: 0.8,
  },
  submitButtonText: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    letterSpacing: -0.01,
    color: '#00363A',
  },
  submitIcon: {
    fontSize: 20,
    color: '#00363A',
  },
  footer: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(185, 202, 203, 0.7)',
  },
  footerLink: {
    color: '#FFB1C3',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;