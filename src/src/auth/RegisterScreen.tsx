import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';
import { registerUser } from '../services/authService';

type Nav = StackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen = () => {
  const navigation = useNavigation<Nav>();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password)
      return Alert.alert('Erreur', 'Remplis tous les champs.');
    if (password.length < 6)
      return Alert.alert('Erreur', 'Mot de passe : 6 caractères minimum.');
    setLoading(true);
    try {
      await registerUser(email, password, username);
    } catch (e: any) {
      Alert.alert('Erreur inscription', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#000' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>TicToc</Text>
        <Text style={styles.subtitle}>Crée ton compte</Text>

        <TextInput style={styles.input} placeholder="Nom d'utilisateur"
          placeholderTextColor="#666" value={username} onChangeText={setUsername} />
        <TextInput style={styles.input} placeholder="Email"
          placeholderTextColor="#666" value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Mot de passe (6+ caractères)"
          placeholderTextColor="#666" value={password} onChangeText={setPassword}
          secureTextEntry />

        <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Création...' : "S'inscrire"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Déjà un compte ? <Text style={styles.linkBold}>Se connecter</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 },
  logo: { color: '#FE2C55', fontSize: 42, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#888', fontSize: 16, textAlign: 'center', marginBottom: 36 },
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

export default RegisterScreen;