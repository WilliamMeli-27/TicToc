// src/services/inboxService.ts
import { db, realtimeDb, COLLECTIONS } from '../lib/firebase';
import auth from '@react-native-firebase/auth';

// Types
export type Notification = {
  id: string;
  type: 'like' | 'comment' | 'follow';
  fromUid: string;
  fromUsername: string;
  fromPhotoURL: string;
  message: string;
  createdAt: number;
  read: boolean;
};

export type Message = {
  id: string;
  fromUid: string;
  toUid: string;
  text: string;
  createdAt: number;
};

export type Conversation = {
  id: string;
  otherUid: string;
  otherUsername: string;
  otherPhotoURL: string;
  lastMessage: string;
  lastMessageAt: number;
  unread: boolean;
};

// Récupère les notifications de l'utilisateur connecté
export const getNotifications = async (): Promise<Notification[]> => {
  const uid = auth().currentUser?.uid;
  if (!uid) return [];

  const snap = await db
    .collection(COLLECTIONS.NOTIFICATIONS)
    .where('toUid', '==', uid)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();

  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
};

// Marque une notification comme lue
export const markNotificationRead = async (notifId: string): Promise<void> => {
  await db.collection(COLLECTIONS.NOTIFICATIONS).doc(notifId).update({ read: true });
};

// Récupère la liste des conversations de l'utilisateur connecté
export const getConversations = async (): Promise<Conversation[]> => {
  const uid = auth().currentUser?.uid;
  if (!uid) return [];

  const snap = await realtimeDb
    .ref('conversations')
    .orderByChild(`members/${uid}`)
    .equalTo(true)
    .once('value');

  if (!snap.exists()) return [];

  const conversations: Conversation[] = [];
  snap.forEach(child => {
    const data = child.val();
    // On récupère l'uid de l'autre personne
    const otherUid = Object.keys(data.members).find(id => id !== uid) || '';
    conversations.push({
      id: child.key || '',
      otherUid,
      otherUsername: data.otherUsername || '',
      otherPhotoURL: data.otherPhotoURL || '',
      lastMessage: data.lastMessage || '',
      lastMessageAt: data.lastMessageAt || 0,
      unread: data.unread?.[uid] || false,
    });
  });

  // Trie par message le plus récent
  return conversations.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
};

// Envoie un message
export const sendMessage = async (toUid: string, text: string): Promise<void> => {
  const uid = auth().currentUser?.uid;
  if (!uid) return;

  // ID de conversation = les deux uids triés et joints
  const convId = [uid, toUid].sort().join('_');
  const now = Date.now();

  // Ajoute le message
  await realtimeDb.ref(`messages/${convId}`).push({
    fromUid: uid,
    toUid,
    text,
    createdAt: now,
  });

  // Met à jour la conversation
  await realtimeDb.ref(`conversations/${convId}`).update({
    members: { [uid]: true, [toUid]: true },
    lastMessage: text,
    lastMessageAt: now,
    unread: { [toUid]: true }, // l'autre a un message non lu
  });
};