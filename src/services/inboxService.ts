import { db, realtimeDb, COLLECTIONS } from '../lib/firebase';
import auth from '@react-native-firebase/auth';

export type Notification = {
  id: string;
  type: 'like' | 'comment' | 'follow';
  fromUid: string;
  fromUsername: string;
  fromPhotoURL: string | null;
  toUid: string;
  videoId?: string;
  message: string;
  createdAt: number;
  read: boolean;
};

export type Conversation = {
  id: string;
  otherUid: string;
  otherUsername: string;
  otherPhotoURL: string | null;
  lastMessage: string;
  lastMessageAt: number;
  unread: boolean;
};

export type Message = {
  id: string;
  fromUid: string;
  toUid: string;
  text: string;
  createdAt: number;
};

const buildMessage = (type: Notification['type']): string => {
  if (type === 'like') return 'a aimé ta vidéo';
  if (type === 'comment') return 'a commenté ta vidéo';
  if (type === 'follow') return 'a commencé à te suivre';
  return '';
};

// Écoute les notifications en temps réel
export const subscribeToNotifications = (
  callback: (notifs: Notification[]) => void
): (() => void) => {
  const uid = auth().currentUser?.uid;
  if (!uid) return () => {};

  const unsub = db
    .collection(COLLECTIONS.NOTIFICATIONS)
    .where('toUid', '==', uid)
    .orderBy('createdAt', 'desc')
    .limit(50)
    .onSnapshot(async (snap) => {
      const notifs: Notification[] = await Promise.all(
        snap.docs.map(async (doc) => {
          const data = doc.data();
          let fromUsername = 'utilisateur';
          let fromPhotoURL: string | null = null;
          try {
            const userDoc = await db
              .collection(COLLECTIONS.USERS)
              .doc(data.fromUid)
              .get();
            if (userDoc.exists()) {
              fromUsername = userDoc.data()?.username ?? 'utilisateur';
              fromPhotoURL = userDoc.data()?.photoURL ?? null;
            }
          } catch {}

          return {
            id: doc.id,
            type: data.type ?? 'like',
            fromUid: data.fromUid ?? '',
            fromUsername,
            fromPhotoURL,
            toUid: data.toUid ?? uid,
            videoId: data.videoId,
            message: data.message ?? buildMessage(data.type),
            createdAt: data.createdAt?.toMillis?.() ?? data.createdAt ?? 0,
            read: data.read ?? false,
          };
        })
      );
      callback(notifs);
    });

  return unsub;
};

// Marque une notification comme lue
export const markNotificationRead = async (notifId: string): Promise<void> => {
  await db
    .collection(COLLECTIONS.NOTIFICATIONS)
    .doc(notifId)
    .update({ read: true });
};

// Marque toutes les notifications comme lues
export const markAllNotificationsRead = async (): Promise<void> => {
  const uid = auth().currentUser?.uid;
  if (!uid) return;
  const snap = await db
    .collection(COLLECTIONS.NOTIFICATIONS)
    .where('toUid', '==', uid)
    .where('read', '==', false)
    .get();
  const batch = db.batch();
  snap.docs.forEach(doc => batch.update(doc.ref, { read: true }));
  await batch.commit();
};

// Écoute les conversations en temps réel (Realtime Database)
export const subscribeToConversations = (
  callback: (convs: Conversation[]) => void
): (() => void) => {
  const uid = auth().currentUser?.uid;
  if (!uid) return () => {};

  const ref = realtimeDb.ref('conversations');

  // Fix TS2345 : on utilise Object.keys au lieu de snap.forEach
  // pour éviter le conflit de type retour void vs true|undefined
  const listener = ref.on('value', (snap) => {
    if (!snap || !snap.exists()) {
      callback([]);
      return;
    }

    const raw = snap.val() as Record<string, any>;
    const conversations: Conversation[] = Object.keys(raw)
      .map((key) => {
        const data = raw[key];
        if (!data?.members?.[uid]) return null;
        const otherUid =
          Object.keys(data.members as Record<string, boolean>).find(
            (id) => id !== uid,
          ) ?? '';
        return {
          id: key,
          otherUid,
          otherUsername: data.usernames?.[otherUid] ?? 'utilisateur',
          otherPhotoURL: data.photoURLs?.[otherUid] ?? null,
          lastMessage: data.lastMessage ?? '',
          lastMessageAt: data.lastMessageAt ?? 0,
          unread: data.unread?.[uid] ?? false,
        } as Conversation;
      })
      .filter((c): c is Conversation => c !== null)
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt);

    callback(conversations);
  });

  return () => ref.off('value', listener);
};

// Envoie un message
export const sendMessage = async (
  toUid: string,
  toUsername: string,
  text: string,
): Promise<void> => {
  const uid = auth().currentUser?.uid;
  if (!uid) return;

  const userDoc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
  const myUsername = userDoc.data()?.username ?? 'utilisateur';
  const myPhotoURL = userDoc.data()?.photoURL ?? null;

  const convId = [uid, toUid].sort().join('_');
  const now = Date.now();

  await realtimeDb.ref(`messages/${convId}`).push({
    fromUid: uid,
    toUid,
    text,
    createdAt: now,
  });

  await realtimeDb.ref(`conversations/${convId}`).update({
    members: { [uid]: true, [toUid]: true },
    usernames: { [uid]: myUsername, [toUid]: toUsername },
    photoURLs: { [uid]: myPhotoURL, [toUid]: null },
    lastMessage: text,
    lastMessageAt: now,
    [`unread/${toUid}`]: true,
  });
};

// Écoute les messages d'une conversation en temps réel
export const subscribeToMessages = (
  otherUid: string,
  callback: (messages: Message[]) => void,
): (() => void) => {
  const uid = auth().currentUser?.uid;
  if (!uid) return () => {};

  const convId = [uid, otherUid].sort().join('_');
  const ref = realtimeDb.ref(`messages/${convId}`).orderByChild('createdAt');

  // Fix TS2345 : même approche Object.keys pour éviter forEach void
  const listener = ref.on('value', (snap) => {
    if (!snap || !snap.exists()) {
      callback([]);
      return;
    }
    const raw = snap.val() as Record<string, any>;
    const messages: Message[] = Object.keys(raw).map((key) => ({
      id: key,
      fromUid: raw[key].fromUid ?? '',
      toUid: raw[key].toUid ?? '',
      text: raw[key].text ?? '',
      createdAt: raw[key].createdAt ?? 0,
    }));
    // Trie par date croissante
    messages.sort((a, b) => a.createdAt - b.createdAt);
    callback(messages);
  });

  realtimeDb.ref(`conversations/${convId}/unread/${uid}`).set(false);

  return () => ref.off('value', listener);
};