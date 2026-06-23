import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';
import { loginUser } from '../services/authService';

type Nav = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Erreur', 'Remplis tous les champs.');
    setLoading(true);
    try {
      await loginUser(email, password);
      // RootNavigator redirige automatiquement via useAuth
    } catch (e: any) {
      Alert.alert('Erreur connexion', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.logo}>TicToc</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Pas encore de compte ? <Text style={styles.linkBold}>Créer un compte</Text></Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', paddingHorizontal: 32 },
  logo: { color: '#FE2C55', fontSize: 42, fontWeight: '700', textAlign: 'center', marginBottom: 48 },
  input: {
    backgroundColor: '#1A1A1A', color: '#FFF', borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 14,
    borderWidth: 1, borderColor: '#333',
  },
  btn: { backgroundColor: '#FE2C55', borderRadius: 8, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  link: { color: '#888', textAlign: 'center', marginTop: 24, fontSize: 14 },
  linkBold: { color: '#FFF', fontWeight: '600' },
});

export default LoginScreen;