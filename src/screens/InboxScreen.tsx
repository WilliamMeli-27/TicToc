import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, ActivityIndicator, Modal,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useInbox } from '../hooks/useInbox';
import { subscribeToMessages, sendMessage, Message } from '../services/inboxService';
import { Notification, Conversation } from '../services/inboxService';
import { firebaseAuth } from '../lib/firebase';

const notifIcon = (type: Notification['type']) => {
  if (type === 'like') return { icon: '♥', color: '#FE2C55' };
  if (type === 'comment') return { icon: '💬', color: '#25F4EE' };
  if (type === 'follow') return { icon: '◎', color: '#FFF' };
  return { icon: '•', color: '#888' };
};

// Fix no-inline-styles : styles déplacés dans StyleSheet
const Avatar = ({ uri, name, size = 46 }: { uri?: string | null; name?: string; size?: number }) => {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.avatarImg, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }
  return (
    <View style={[styles.avatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarLetter, { fontSize: size * 0.4 }]}>
        {name?.charAt(0).toUpperCase() ?? '?'}
      </Text>
    </View>
  );
};

const InboxScreen = () => {
  const { notifications, conversations, loading, unreadCount, readNotification, readAllNotifications } = useInbox();
  const [activeTab, setActiveTab] = useState<'notifs' | 'messages'>('notifs');

  const [chatOpen, setChatOpen] = useState(false);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const myUid = firebaseAuth.currentUser?.uid ?? '';

  // Fix @typescript-eslint/no-unused-vars 'unsub' :
  // on stocke le cleanup dans un ref pour l'appeler à la fermeture
  const unsubRef = useRef<(() => void) | null>(null);

  const openChat = (conv: Conversation) => {
    if (unsubRef.current) unsubRef.current();
    setActiveConv(conv);
    setChatOpen(true);
    unsubRef.current = subscribeToMessages(conv.otherUid, (msgs) => {
      setMessages(msgs);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    });
  };

  const closeChat = () => {
    if (unsubRef.current) {
      unsubRef.current();
      unsubRef.current = null;
    }
    setChatOpen(false);
    setMessages([]);
  };

  const handleSend = async () => {
    if (!msgText.trim() || !activeConv) return;
    setSending(true);
    try {
      await sendMessage(activeConv.otherUid, activeConv.otherUsername, msgText.trim());
      setMsgText('');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FE2C55" size="large" />
      </View>
    );
  }

  const renderNotif = ({ item }: { item: Notification }) => {
    const { icon, color } = notifIcon(item.type);
    return (
      <TouchableOpacity
        style={[styles.row, !item.read && styles.rowUnread]}
        onPress={() => readNotification(item.id)}>
        <Avatar uri={item.fromPhotoURL} name={item.fromUsername} />
        <View style={styles.rowContent}>
          <Text style={styles.rowText}>
            <Text style={styles.bold}>{item.fromUsername}</Text>
            {' '}{item.message}
          </Text>
          <Text style={styles.time}>
            {new Date(item.createdAt).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        <Text style={[styles.notifIcon, { color }]}>{icon}</Text>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const renderConv = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[styles.row, item.unread && styles.rowUnread]}
      onPress={() => openChat(item)}>
      <Avatar uri={item.otherPhotoURL} name={item.otherUsername} />
      <View style={styles.rowContent}>
        <Text style={styles.bold}>{item.otherUsername}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      {item.unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.fromUid === myUid;
    return (
      <View style={[styles.msgBubbleWrap, isMe ? styles.msgMe : styles.msgOther]}>
        <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleOther]}>
          <Text style={styles.msgText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
        {unreadCount > 0 && activeTab === 'notifs' && (
          <TouchableOpacity onPress={readAllNotifications}>
            <Text style={styles.readAllBtn}>Tout lire ({unreadCount})</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifs' && styles.tabActive]}
          onPress={() => setActiveTab('notifs')}>
          <Text style={[styles.tabText, activeTab === 'notifs' && styles.tabTextActive]}>
            Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'messages' && styles.tabActive]}
          onPress={() => setActiveTab('messages')}>
          <Text style={[styles.tabText, activeTab === 'messages' && styles.tabTextActive]}>
            Messages
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'notifs' ? (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderNotif}
          ListEmptyComponent={<Text style={styles.empty}>Aucune notification</Text>}
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={renderConv}
          ListEmptyComponent={<Text style={styles.empty}>Aucun message</Text>}
        />
      )}

      <Modal visible={chatOpen} animationType="slide">
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={closeChat}>
              <Text style={styles.chatBack}>←</Text>
            </TouchableOpacity>
            <Avatar uri={activeConv?.otherPhotoURL} name={activeConv?.otherUsername} size={36} />
            <Text style={styles.chatUsername}>{activeConv?.otherUsername}</Text>
          </View>

          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.msgList}
            ListEmptyComponent={
              <Text style={styles.empty}>Commencez la conversation !</Text>
            }
          />

          <View style={styles.msgInputRow}>
            <TextInput
              style={styles.msgInput}
              placeholder="Message..."
              placeholderTextColor="#666"
              value={msgText}
              onChangeText={setMsgText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!msgText.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!msgText.trim() || sending}>
              {sending
                ? <ActivityIndicator color="#FFF" size="small" />
                : <Text style={styles.sendBtnText}>↑</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: 16, paddingBottom: 12,
  },
  title: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  readAllBtn: { color: '#FE2C55', fontSize: 13 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#222' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#FE2C55' },
  tabText: { color: '#555', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#FFF' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderBottomColor: '#111',
    gap: 12,
  },
  rowUnread: { backgroundColor: '#111' },
  rowContent: { flex: 1 },
  rowText: { color: '#FFF', fontSize: 14, lineHeight: 20 },
  bold: { color: '#FFF', fontWeight: '700' },
  time: { color: '#555', fontSize: 12, marginTop: 3 },
  notifIcon: { fontSize: 20, marginLeft: 4 },
  lastMessage: { color: '#888', fontSize: 13, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FE2C55' },
  empty: { color: '#555', textAlign: 'center', marginTop: 48, fontSize: 14 },
  // Fix no-inline-styles pour Avatar
  avatarImg: { backgroundColor: '#333' },
  avatarPlaceholder: { backgroundColor: '#FE2C55', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#FFF', fontWeight: '700' },
  // Chat
  chatContainer: { flex: 1, backgroundColor: '#000' },
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 50, paddingHorizontal: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#222',
  },
  chatBack: { color: '#FFF', fontSize: 24, marginRight: 4 },
  chatUsername: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  msgList: { padding: 16, gap: 8 },
  msgBubbleWrap: { marginVertical: 4 },
  msgMe: { alignItems: 'flex-end' },
  msgOther: { alignItems: 'flex-start' },
  msgBubble: { maxWidth: '75%', borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14 },
  msgBubbleMe: { backgroundColor: '#FE2C55', borderBottomRightRadius: 4 },
  msgBubbleOther: { backgroundColor: '#1A1A1A', borderBottomLeftRadius: 4 },
  msgText: { color: '#FFF', fontSize: 15, lineHeight: 20 },
  msgInputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    padding: 12, borderTopWidth: 1, borderTopColor: '#222',
  },
  msgInput: {
    flex: 1, backgroundColor: '#1A1A1A', color: '#FFF', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 15,
    maxHeight: 100, borderWidth: 1, borderColor: '#333',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FE2C55', justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#FFF', fontSize: 22, fontWeight: '700' },
});

export default InboxScreen;
