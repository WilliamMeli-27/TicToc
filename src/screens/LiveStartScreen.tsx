import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { generateChannelId } from '../lib/agora';
import { firebaseAuth } from '../lib/firebase';

const LiveStartScreen = () => {
  const navigation = useNavigation<any>();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!title.trim()) return;
    setLoading(true);
    const uid = firebaseAuth.currentUser?.uid ?? '';
    const channelId = generateChannelId(uid);
    navigation.replace('LiveHost', { title: title.trim(), channelId });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Lancer un live</Text>
      <Text style={styles.subtitle}>Donne un titre à ton live</Text>

      <TextInput
        style={styles.input}
        placeholder="Ex: Cuisinons ensemble 🍳"
        placeholderTextColor="#555"
        value={title}
        onChangeText={setTitle}
        maxLength={60}
        autoFocus
      />
      <Text style={styles.charCount}>{title.length}/60</Text>

      <TouchableOpacity
        style={[styles.startBtn, (!title.trim() || loading) && styles.startBtnOff]}
        onPress={handleStart}
        disabled={!title.trim() || loading}>
        {loading
          ? <ActivityIndicator color="#FFF" />
          : <Text style={styles.startBtnText}>🔴 Démarrer le live</Text>
        }
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 24 },
  backText: { color: '#FFF', fontSize: 24 },
  title: { color: '#FFF', fontSize: 26, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#888', fontSize: 15, marginBottom: 32 },
  input: {
    backgroundColor: '#1A1A1A', color: '#FFF', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16,
    borderWidth: 1, borderColor: '#333', marginBottom: 6,
  },
  charCount: { color: '#555', fontSize: 12, textAlign: 'right', marginBottom: 32 },
  startBtn: {
    backgroundColor: '#FE2C55', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  startBtnOff: { opacity: 0.4 },
  startBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});

export default LiveStartScreen;