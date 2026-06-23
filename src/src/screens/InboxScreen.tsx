// src/screens/InboxScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useInbox } from '../hooks/useInbox';
import { Notification, Conversation } from '../services/inboxService';

// Icône selon le type de notification
const notifIcon = (type: Notification['type']) => {
  if (type === 'like') return '♥';
  if (type === 'comment') return '💬';
  if (type === 'follow') return '◎';
  return '•';
};

const InboxScreen = () => {
  const { notifications, conversations, loading, unreadCount, readNotification } = useInbox();
  const [activeTab, setActiveTab] = useState<'notifs' | 'messages'>('notifs');

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FE2C55" size="large" />
      </View>
    );
  }

  // Rendu d'une notification
  const renderNotif = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.row, !item.read && styles.rowUnread]}
      onPress={() => readNotification(item.id)}>
      {/* Photo de l'utilisateur */}
      <Image
        source={
          item.fromPhotoURL
            ? { uri: item.fromPhotoURL }
            : require('../assets/default-avatar.png')
        }
        style={styles.avatar}
      />
      <View style={styles.rowContent}>
        <Text style={styles.rowText}>
          <Text style={styles.bold}>{item.fromUsername}</Text> {item.message}
        </Text>
        <Text style={styles.time}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      {/* Icône type de notif */}
      <Text style={styles.notifIcon}>{notifIcon(item.type)}</Text>
    </TouchableOpacity>
  );

  // Rendu d'une conversation
  const renderConv = ({ item }: { item: Conversation }) => (
    <TouchableOpacity style={[styles.row, item.unread && styles.rowUnread]}>
      <Image
        source={
          item.otherPhotoURL
            ? { uri: item.otherPhotoURL }
            : require('../assets/default-avatar.png')
        }
        style={styles.avatar}
      />
      <View style={styles.rowContent}>
        <Text style={styles.bold}>{item.otherUsername}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      {/* Point rouge si non lu */}
      {item.unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Titre */}
      <Text style={styles.title}>Inbox</Text>

      {/* Onglets */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifs' && styles.tabActive]}
          onPress={() => setActiveTab('notifs')}>
          <Text style={styles.tabText}>
            Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'messages' && styles.tabActive]}
          onPress={() => setActiveTab('messages')}>
          <Text style={styles.tabText}>Messages</Text>
        </TouchableOpacity>
      </View>

      {/* Contenu selon l'onglet */}
      {activeTab === 'notifs' ? (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderNotif}
          ListEmptyComponent={
            <Text style={styles.empty}>Aucune notification</Text>
          }
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={renderConv}
          ListEmptyComponent={
            <Text style={styles.empty}>Aucun message</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#FFF', fontSize: 20, fontWeight: '700', textAlign: 'center', paddingTop: 40, paddingBottom: 16 },

  // Onglets
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#222' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#FE2C55' },
  tabText: { color: '#FFF', fontSize: 14, fontWeight: '600' },

  // Ligne (notif ou message)
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#111' },
  rowUnread: { backgroundColor: '#1A1A1A' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#333', marginRight: 12 },
  rowContent: { flex: 1 },
  rowText: { color: '#FFF', fontSize: 14, lineHeight: 20 },
  bold: { color: '#FFF', fontWeight: '700' },
  time: { color: '#888', fontSize: 12, marginTop: 3 },
  notifIcon: { fontSize: 18, marginLeft: 8 },
  lastMessage: { color: '#888', fontSize: 13, marginTop: 2 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FE2C55', marginLeft: 8 },

  // Vide
  empty: { color: '#888', textAlign: 'center', marginTop: 40, fontSize: 14 },
});

export default InboxScreen;