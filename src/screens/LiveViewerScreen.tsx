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
  RtcRemoteView,
} from 'react-native-agora';
import { AGORA_CONFIG } from '../lib/agora';
import {
  updateViewersCount, sendLiveMessage,
  subscribeToLiveChat, sendJoinRequest,
  subscribeToMyRequestStatus, LiveMessage,
} from '../services/liveService';
import { firebaseAuth } from '../lib/firebase';
import { useNavigation } from '@react-navigation/native';

const LiveViewerScreen = ({ route }: any) => {
  const { liveId, channelId, hostUsername, title } = route.params;
  const navigation = useNavigation();
  const uid = firebaseAuth.currentUser?.uid ?? '';

  const engine = useRef<RtcEngine | null>(null);
  const [hostUid, setHostUid] = useState<number | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [msgText, setMsgText] = useState('');
  const [requestStatus, setRequestStatus] = useState<
    'none' | 'pending' | 'accepted' | 'rejected'
  >('none');
  const [joined, setJoined] = useState(false);
  const chatRef = useRef<FlatList>(null);

  const initAgora = useCallback(async () => {
    try {
      engine.current = await RtcEngine.create(AGORA_CONFIG.appId);
      await engine.current.enableVideo();
      await engine.current.setChannelProfile(
        ChannelProfile.LiveBroadcasting
      );
      // Spectateur par défaut
      await engine.current.setClientRole(ClientRole.Audience);
      // Désactive caméra/micro au départ
      await engine.current.enableLocalVideo(false);
      await engine.current.enableLocalAudio(false);

      // Écoute l'hôte qui publie
      engine.current.addListener('UserJoined', (remoteUid: number) => {
        setHostUid(remoteUid);
        setJoined(true);
      });

      engine.current.addListener('UserOffline', (_remoteUid: number) => {
        Alert.alert('Live terminé', "L'hôte a terminé le live.");
        navigation.goBack();
      });

      await engine.current.joinChannel(null, channelId, null, 0);

    } catch (e: any) {
      Alert.alert('Erreur', e.message);
      navigation.goBack();
    }
  }, [channelId, navigation]);

  useEffect(() => {
    initAgora();
    updateViewersCount(liveId, 1);

    const unsubChat = subscribeToLiveChat(liveId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => chatRef.current?.scrollToEnd({ animated: true }), 100);
    });

    const unsubStatus = subscribeToMyRequestStatus(liveId, uid, (status) => {
      if (status === 'accepted') {
        setRequestStatus('accepted');
        // Passe en mode broadcaster dans Agora
        engine.current?.setClientRole(ClientRole.Broadcaster);
        engine.current?.enableLocalVideo(true);
        engine.current?.enableLocalAudio(true);
      } else if (status === 'rejected') {
        setRequestStatus('rejected');
      } else if (status === 'pending') {
        setRequestStatus('pending');
      }
    });

    return () => {
      updateViewersCount(liveId, -1);
      engine.current?.leaveChannel();
      engine.current?.destroy();
      unsubChat();
      unsubStatus();
    };
  }, [initAgora, liveId, uid]);

  const handleSendMsg = async () => {
    if (!msgText.trim()) return;
    await sendLiveMessage(liveId, msgText.trim());
    setMsgText('');
  };

  const handleJoinRequest = async () => {
    if (requestStatus !== 'none') return;
    await sendJoinRequest(liveId);
    setRequestStatus('pending');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      {/* Vidéo de l'hôte */}
      {joined && hostUid !== null ? (
        <RtcRemoteView.SurfaceView
          style={StyleSheet.absoluteFill}
          uid={hostUid}
          channelId={channelId}
        />
      ) : (
        <View style={styles.waiting}>
          <ActivityIndicator color="#FE2C55" size="large" />
          <Text style={styles.waitingText}>Connexion au live...</Text>
        </View>
      )}

      {/* Si accepté → affiche sa propre caméra en PiP */}
      {requestStatus === 'accepted' && (
        <RtcLocalView.SurfaceView
          style={styles.pip}
        />
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.liveTag}>
          <Text style={styles.liveTagText}>🔴 LIVE</Text>
        </View>
        <Text style={styles.hostName}>{hostUsername}</Text>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Titre du live */}
      <View style={styles.titleRow} pointerEvents="none">
        <Text style={styles.titleText}>{title}</Text>
      </View>

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

      {/* Bas : input + bouton rejoindre */}
      <View style={styles.bottomRow}>
        <TextInput
          style={styles.input}
          placeholder="Commente..."
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

        {/* Bouton demande de participation */}
        {requestStatus === 'none' && (
          <TouchableOpacity style={styles.joinBtn} onPress={handleJoinRequest}>
            <Text style={styles.joinBtnText}>🎤</Text>
          </TouchableOpacity>
        )}
        {requestStatus === 'pending' && (
          <View style={styles.joinBtn}>
            <Text style={styles.joinBtnText}>⏳</Text>
          </View>
        )}
        {requestStatus === 'accepted' && (
          <View style={[styles.joinBtn, styles.joinBtnAccepted]}>
            <Text style={styles.joinBtnText}>🎙</Text>
          </View>
        )}
        {requestStatus === 'rejected' && (
          <View style={[styles.joinBtn, styles.joinBtnRejected]}>
            <Text style={styles.joinBtnText}>✕</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  waiting: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  waitingText: { color: '#FFF', marginTop: 16, fontSize: 16 },
  pip: {
    position: 'absolute', top: 100, right: 16,
    width: 100, height: 150, borderRadius: 10,
    overflow: 'hidden', borderWidth: 2, borderColor: '#FFF',
  },
  header: {
    position: 'absolute', top: 44, left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  liveTag: {
    backgroundColor: '#FE2C55', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  liveTagText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  hostName: { color: '#FFF', fontWeight: '700', fontSize: 15, flex: 1 },
  closeBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20,
    width: 36, height: 36, justifyContent: 'center', alignItems: 'center',
  },
  closeBtnText: { color: '#FFF', fontSize: 18 },
  titleRow: { position: 'absolute', top: 100, left: 16 },
  titleText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  chat: { position: 'absolute', bottom: 80, left: 0, right: 0, maxHeight: 200 },
  chatContent: { paddingHorizontal: 16, gap: 4 },
  msgRow: { flexDirection: 'row', flexWrap: 'wrap' },
  msgUsername: { color: '#FE2C55', fontWeight: '700', fontSize: 13 },
  msgText: { color: '#FFF', fontSize: 13 },
  bottomRow: {
    position: 'absolute', bottom: 16, left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 8,
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
  joinBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  joinBtnAccepted: { backgroundColor: '#25F4EE' },
  joinBtnRejected: { backgroundColor: '#555' },
  joinBtnText: { fontSize: 20 },
});

export default LiveViewerScreen;