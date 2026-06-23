import { db, realtimeDb, COLLECTIONS } from '../lib/firebase';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export type LiveSession = {
  id: string;
  hostUid: string;
  hostUsername: string;
  hostAvatar: string | null;
  channelId: string;
  title: string;
  viewersCount: number;
  startedAt: number;
  active: boolean;
};

export type JoinRequest = {
  id: string;
  fromUid: string;
  fromUsername: string;
  fromAvatar: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
};

export type LiveMessage = {
  id: string;
  fromUid: string;
  fromUsername: string;
  text: string;
  createdAt: number;
};

// Démarre un live
export const startLive = async (title: string, channelId: string): Promise<string> => {
  const uid = auth().currentUser?.uid;
  if (!uid) throw new Error('Non connecté');

  const userDoc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
  const userData = userDoc.data();

  const liveRef = await db.collection(COLLECTIONS.LIVES).add({
    hostUid: uid,
    hostUsername: userData?.username ?? 'utilisateur',
    hostAvatar: userData?.photoURL ?? null,
    channelId,
    title,
    viewersCount: 0,
    startedAt: firestore.FieldValue.serverTimestamp(),
    active: true,
  });

  // Initialise le chat et les demandes dans Realtime DB
  await realtimeDb.ref(`lives/${liveRef.id}`).set({
    active: true,
    hostUid: uid,
    channelId,
  });

  return liveRef.id;
};

// Termine un live
export const endLive = async (liveId: string): Promise<void> => {
  await db.collection(COLLECTIONS.LIVES).doc(liveId).update({ active: false });
  await realtimeDb.ref(`lives/${liveId}`).update({ active: false });
};

// Écoute les lives actifs
export const subscribeToActiveLives = (
  callback: (lives: LiveSession[]) => void
): (() => void) => {
  return db
    .collection(COLLECTIONS.LIVES)
    .where('active', '==', true)
    .orderBy('startedAt', 'desc')
    .onSnapshot(
      snap => {
        // Guard — snap ou snap.docs peut être null si l'index n'existe pas encore
        if (!snap || !snap.docs) {
          callback([]);
          return;
        }
        const lives: LiveSession[] = snap.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<LiveSession, 'id'>),
        }));
        callback(lives);
      },
      error => {
        // Affiche l'erreur dans Metro pour diagnostic
        console.error('subscribeToActiveLives error:', error.message);
        callback([]);
      }
    );
};

// Incrémente/décrémente les spectateurs
export const updateViewersCount = async (
  liveId: string,
  delta: 1 | -1
): Promise<void> => {
  await db.collection(COLLECTIONS.LIVES).doc(liveId).update({
    viewersCount: firestore.FieldValue.increment(delta),
  });
};

// Envoie une demande de rejoindre
export const sendJoinRequest = async (
  liveId: string
): Promise<void> => {
  const uid = auth().currentUser?.uid;
  if (!uid) return;

  const userDoc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
  const userData = userDoc.data();

  await realtimeDb.ref(`lives/${liveId}/requests/${uid}`).set({
    fromUid: uid,
    fromUsername: userData?.username ?? 'utilisateur',
    fromAvatar: userData?.photoURL ?? null,
    status: 'pending',
    createdAt: Date.now(),
  });
};

// Répond à une demande (hôte)
export const respondToJoinRequest = async (
  liveId: string,
  fromUid: string,
  accept: boolean
): Promise<void> => {
  await realtimeDb
    .ref(`lives/${liveId}/requests/${fromUid}/status`)
    .set(accept ? 'accepted' : 'rejected');
};

// Écoute les demandes (hôte)
export const subscribeToJoinRequests = (
  liveId: string,
  callback: (requests: JoinRequest[]) => void
): (() => void) => {
  const ref = realtimeDb.ref(`lives/${liveId}/requests`);
  const listener = ref.on('value', snap => {
    if (!snap || !snap.exists()) { callback([]); return; }
    const raw = snap.val() as Record<string, any>;
    const requests: JoinRequest[] = Object.keys(raw)
      .map(key => ({ id: key, ...raw[key] } as JoinRequest))
      .filter(r => r.status === 'pending');
    callback(requests);
  });
  return () => ref.off('value', listener);
};

// Écoute le statut de sa propre demande (spectateur)
export const subscribeToMyRequestStatus = (
  liveId: string,
  myUid: string,
  callback: (status: 'pending' | 'accepted' | 'rejected' | null) => void
): (() => void) => {
  const ref = realtimeDb.ref(`lives/${liveId}/requests/${myUid}/status`);
  const listener = ref.on('value', snap => {
    callback(snap.val() ?? null);
  });
  return () => ref.off('value', listener);
};

// Envoie un message dans le chat du live
export const sendLiveMessage = async (
  liveId: string,
  text: string
): Promise<void> => {
  const uid = auth().currentUser?.uid;
  if (!uid) return;
  const userDoc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
  await realtimeDb.ref(`lives/${liveId}/chat`).push({
    fromUid: uid,
    fromUsername: userDoc.data()?.username ?? 'utilisateur',
    text,
    createdAt: Date.now(),
  });
};

// Écoute le chat du live
export const subscribeToLiveChat = (
  liveId: string,
  callback: (messages: LiveMessage[]) => void
): (() => void) => {
  const ref = realtimeDb
    .ref(`lives/${liveId}/chat`)
    .orderByChild('createdAt')
    .limitToLast(100);

  const listener = ref.on('value', snap => {
    if (!snap || !snap.exists()) { callback([]); return; }
    const raw = snap.val() as Record<string, any>;
    const messages: LiveMessage[] = Object.keys(raw)
      .map(key => ({ id: key, ...raw[key] }))
      .sort((a, b) => a.createdAt - b.createdAt);
    callback(messages);
  });
  return () => ref.off('value', listener);
};