import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { subscribeToActiveLives, LiveSession } from '../services/liveService';
import { firebaseAuth } from '../lib/firebase';

const LiveListScreen = () => {
  const navigation = useNavigation<any>();
  const [lives, setLives] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const myUid = firebaseAuth.currentUser?.uid ?? '';

  useEffect(() => {
    const unsub = subscribeToActiveLives((data) => {
      setLives(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const goToLive = (live: LiveSession) => {
    if (live.hostUid === myUid) {
      // Je suis l'hôte → page hôte
      navigation.navigate('LiveHost', { title: live.title, liveId: live.id });
    } else {
      // Spectateur
      navigation.navigate('LiveViewer', {
        liveId: live.id,
        channelId: live.channelId,
        hostUsername: live.hostUsername,
        title: live.title,
      });
    }
  };

  const startMyLive = () => {
    navigation.navigate('LiveStart');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FE2C55" size="large" />
      </View>
    );
  }

  const renderLive = ({ item }: { item: LiveSession }) => (
    <TouchableOpacity style={styles.card} onPress={() => goToLive(item)}>
      {/* Avatar hôte */}
      {item.hostAvatar ? (
        <Image source={{ uri: item.hostAvatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarLetter}>
            {item.hostUsername?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
      )}
      <View style={styles.liveBadge}>
        <Text style={styles.liveBadgeText}>LIVE</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardHost}>@{item.hostUsername}</Text>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardViewers}>👁 {item.viewersCount} spectateurs</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lives</Text>
        <TouchableOpacity style={styles.startBtn} onPress={startMyLive}>
          <Text style={styles.startBtnText}>+ Lancer un live</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={lives}
        keyExtractor={item => item.id}
        renderItem={renderLive}
        numColumns={2}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📡</Text>
            <Text style={styles.emptyText}>Aucun live en cours</Text>
            <TouchableOpacity style={styles.startBtnBig} onPress={startMyLive}>
              <Text style={styles.startBtnText}>Sois le premier à lancer un live !</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16,
  },
  title: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  startBtn: {
    backgroundColor: '#FE2C55', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  startBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  grid: { padding: 8 },
  card: {
    flex: 1, margin: 4, backgroundColor: '#1A1A1A',
    borderRadius: 12, overflow: 'hidden', minHeight: 180,
  },
  avatar: { width: '100%', height: 130, backgroundColor: '#333' },
  avatarPlaceholder: {
    width: '100%', height: 130, backgroundColor: '#FE2C55',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarLetter: { color: '#FFF', fontSize: 42, fontWeight: '700' },
  liveBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: '#FE2C55', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  liveBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  cardInfo: { padding: 10 },
  cardHost: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  cardTitle: { color: '#888', fontSize: 12, marginTop: 2 },
  cardViewers: { color: '#FE2C55', fontSize: 11, marginTop: 4 },
  emptyContainer: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#888', fontSize: 16, marginBottom: 20 },
  startBtnBig: {
    backgroundColor: '#FE2C55', borderRadius: 10,
    paddingHorizontal: 20, paddingVertical: 12,
  },
});

export default LiveListScreen;