import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, TextInput, KeyboardAvoidingView,
  Platform, Alert, ActivityIndicator,
} from 'react-native';
import RtcEngine, {
  ChannelProfile,
  ClientRole,
  RtcLocalView,
} from 'react-native-agora';
import { AGORA_CONFIG, generateChannelId } from '../lib/agora';
import {
  startLive, endLive, sendLiveMessage,
  subscribeToLiveChat, subscribeToJoinRequests,
  respondToJoinRequest, LiveMessage, JoinRequest,
} from '../services/liveService';
import { firebaseAuth } from '../lib/firebase';
import { useNavigation } from '@react-navigation/native';

const LiveHostScreen = ({ route }: any) => {
  const { title } = route.params ?? { title: 'Mon live' };
  const navigation = useNavigation();
  const uid = firebaseAuth.currentUser?.uid ?? '';

  const engine = useRef<RtcEngine | null>(null);
  const [joined, setJoined] = useState(false);
  const [liveId, setLiveId] = useState<string | null>(null);
  const liveIdRef = useRef<string | null>(null);
  const [channelId] = useState(() => generateChannelId(uid));
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [msgText, setMsgText] = useState('');
  const [viewersCount, setViewersCount] = useState(0);
  const [starting, setStarting] = useState(true);
  const chatRef = useRef<FlatList>(null);

  const initAgora = useCallback(async () => {
    try {
      engine.current = await RtcEngine.create(AGORA_CONFIG.appId);
      await engine.current.enableVideo();
      await engine.current.setChannelProfile(ChannelProfile.LiveBroadcasting);
      await engine.current.setClientRole(ClientRole.Broadcaster);
      await engine.current.startPreview();

      // Rejoindre le canal Agora
      await engine.current.joinChannel(null, channelId, null, 0);

      // Créer le live dans Firebase
      const id = await startLive(title, channelId);
      setLiveId(id);
      liveIdRef.current = id;
      setJoined(true);
      setStarting(false);

      // Écouter le chat
      subscribeToLiveChat(id, (msgs) => {
        setMessages(msgs);
        setTimeout(() => chatRef.current?.scrollToEnd({ animated: true }), 100);
      });

      // Écouter les demandes
      subscribeToJoinRequests(id, setRequests);

      // Écouter les spectateurs qui rejoignent Agora
      engine.current.addListener('UserJoined', (_remoteUid: number) => {
        setViewersCount(v => v + 1);
      });
      engine.current.addListener('UserOffline', (_remoteUid: number) => {
        setViewersCount(v => Math.max(0, v - 1));
      });

    } catch (e: any) {
      Alert.alert('Erreur', e.message);
      navigation.goBack();
    }
  }, [channelId, title, navigation]);

  const cleanup = useCallback(async () => {
    if (liveIdRef.current) await endLive(liveIdRef.current);
    await engine.current?.leaveChannel();
    await engine.current?.destroy();
  }, []);

  useEffect(() => {
    initAgora();
    return () => { cleanup(); };
  }, [initAgora, cleanup]);

  const handleEndLive = () => {
    Alert.alert('Terminer le live', 'Es-tu sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Terminer', style: 'destructive',
        onPress: async () => { await cleanup(); navigation.goBack(); },
      },
    ]);
  };

  const handleSendMsg = async () => {
    if (!msgText.trim() || !liveId) return;
    await sendLiveMessage(liveId, msgText.trim());
    setMsgText('');
  };

  const handleRespondRequest = async (req: JoinRequest, accept: boolean) => {
    if (!liveId) return;
    await respondToJoinRequest(liveId, req.fromUid, accept);
  };

  if (starting) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FE2C55" size="large" />
        <Text style={styles.startingText}>Démarrage du live...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      {/* Caméra locale */}
      {joined && (
        <RtcLocalView.SurfaceView
          style={styles.camera}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.liveTag}>
          <Text style={styles.liveTagText}>🔴 LIVE</Text>
        </View>
        <View style={styles.viewersTag}>
          <Text style={styles.viewersText}>👁 {viewersCount}</Text>
        </View>
        <TouchableOpacity style={styles.endBtn} onPress={handleEndLive}>
          <Text style={styles.endBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Titre */}
      <View style={styles.titleRow} pointerEvents="none">
        <Text style={styles.titleText}>{title}</Text>
      </View>

      {/* Demandes de participation en attente */}
      {requests.length > 0 && (
        <View style={styles.requestsBox}>
          <Text style={styles.requestsTitle}>Demandes ({requests.length})</Text>
          {requests.map(req => (
            <View key={req.id} style={styles.requestRow}>
              <Text style={styles.requestName}>{req.fromUsername}</Text>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => handleRespondRequest(req, true)}>
                <Text style={styles.acceptBtnText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => handleRespondRequest(req, false)}>
                <Text style={styles.rejectBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Chat */}
      <FlatList
        ref={chatRef}
        data={messages}
        keyExtractor={item => item.id}
        style={styles.chat}
        contentContainerStyle={styles.chatContent}
        renderItem={({ item }) => (
          <View style={styles.msgRow}>
            <Text style={styles.msgUsername}>{item.fromUsername} </Text>
            <Text style={styles.msgText}>{item.text}</Text>
          </View>
        )}
        pointerEvents="none"
      />

      {/* Input message */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Dis quelque chose..."
          placeholderTextColor="#888"
          value={msgText}
          onChangeText={setMsgText}
          onSubmitEditing={handleSendMsg}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !msgText.trim() && styles.sendBtnOff]}
          onPress={handleSendMsg}
          disabled={!msgText.trim()}>
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  startingText: { color: '#FFF', marginTop: 16, fontSize: 16 },
  camera: { ...StyleSheet.absoluteFill },
  header: {
    position: 'absolute', top: 44, left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  liveTag: {
    backgroundColor: '#FE2C55', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  liveTagText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  viewersTag: {
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  viewersText: { color: '#FFF', fontSize: 13 },
  endBtn: {
    marginLeft: 'auto' as any,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20,
    width: 36, height: 36, justifyContent: 'center', alignItems: 'center',
  },
  endBtnText: { color: '#FFF', fontSize: 18 },
  titleRow: {
    position: 'absolute', top: 100, left: 16,
  },
  titleText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  requestsBox: {
    position: 'absolute', top: 130, left: 16, right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 10, padding: 12,
  },
  requestsTitle: { color: '#FFF', fontWeight: '700', fontSize: 13, marginBottom: 8 },
  requestRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  requestName: { color: '#FFF', flex: 1, fontSize: 13 },
  acceptBtn: {
    backgroundColor: '#25F4EE', borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 4, marginRight: 6,
  },
  acceptBtnText: { color: '#000', fontWeight: '700' },
  rejectBtn: {
    backgroundColor: '#FE2C55', borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  rejectBtnText: { color: '#FFF', fontWeight: '700' },
  chat: { position: 'absolute', bottom: 70, left: 0, right: 0, maxHeight: 200 },
  chatContent: { paddingHorizontal: 16, gap: 4 },
  msgRow: { flexDirection: 'row', flexWrap: 'wrap' },
  msgUsername: { color: '#FE2C55', fontWeight: '700', fontSize: 13 },
  msgText: { color: '#FFF', fontSize: 13 },
  inputRow: {
    position: 'absolute', bottom: 16, left: 16, right: 16,
    flexDirection: 'row', gap: 8,
  },
  input: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10,
    color: '#FFF', fontSize: 14,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FE2C55', justifyContent: 'center', alignItems: 'center',
  },
  sendBtnOff: { opacity: 0.4 },
  sendBtnText: { color: '#FFF', fontSize: 20, fontWeight: '700' },
});

export default LiveHostScreen;