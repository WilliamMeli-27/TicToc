import { db, COLLECTIONS } from '../lib/firebase';
import auth from '@react-native-firebase/auth';
import { UserProfile } from './authService';

export type VideoItem = {
  id: string;
  videoUrl: string;
  thumbnailURL: string;
  viewsCount: number;
  likesCount: number;
  caption: string;
  createdAt: number;
};

// Récupère le profil
export const getProfile = async (uid: string): Promise<UserProfile | null> => {
  const doc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
  return doc.exists() ? (doc.data() as UserProfile) : null;
};

// Met à jour le profil
export const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
  const uid = auth().currentUser?.uid;
  if (!uid) throw new Error('Non connecté');
  await db.collection(COLLECTIONS.USERS).doc(uid).update(data);
};

// Vidéos postées par l'utilisateur
export const getUserVideos = async (uid: string): Promise<VideoItem[]> => {
  const snap = await db
    .collection(COLLECTIONS.VIDEOS)
    .where('uploaderUid', '==', uid)
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<VideoItem, 'id'>),
  }));
};

// Vidéos likées par l'utilisateur
export const getLikedVideos = async (uid: string): Promise<VideoItem[]> => {
  const likesSnap = await db
    .collection(COLLECTIONS.LIKES)
    .where('userId', '==', uid)
    .get();

  if (likesSnap.empty) return [];

  const videoIds = likesSnap.docs.map(doc => doc.data().videoId);
  const videos: VideoItem[] = [];

  for (const videoId of videoIds) {
    const videoDoc = await db.collection(COLLECTIONS.VIDEOS).doc(videoId).get();
    if (videoDoc.exists()) {
      videos.push({
        id: videoDoc.id,
        ...(videoDoc.data() as Omit<VideoItem, 'id'>),
      });
    }
  }
  return videos;
};