// src/services/videoService.ts
import { db, COLLECTIONS } from '../lib/firebase';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
export interface Video {
  id: string;
  publicId: string;
  videoUrl: string;
  thumbnailURL: string;
  uploaderUid: string;
  uploaderUsername: string;
  uploaderAvatar: string | null;
  caption: string;
  category: string;
  duration: number;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: number;
}
const PAGE_SIZE = 10;

// Charge les vidéos avec pagination (utilisé par Accueil)
export const fetchVideos = async (
  lastDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot
): Promise<{ videos: Video[]; lastDoc: FirebaseFirestoreTypes.QueryDocumentSnapshot | null }> => {

  let query = db
    .collection(COLLECTIONS.VIDEOS)
    .orderBy('createdAt', 'desc')
    .limit(PAGE_SIZE);

  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }

  const snapshot = await query.get();
  if (snapshot.empty) return { videos: [], lastDoc: null };

  const videos: Video[] = snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<Video, 'id'>),
  }));

  return {
    videos,
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
  };
};

// Recherche par caption (utilisé par Découvrir)
export const searchVideos = async (query: string): Promise<Video[]> => {
  if (!query.trim()) return [];

  const snapshot = await db
    .collection(COLLECTIONS.VIDEOS)
    .where('caption', '>=', query)
    .where('caption', '<=', query + '\uf8ff')
    .limit(20)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<Video, 'id'>),
  }));
};

// Filtre par catégorie (utilisé par Découvrir)
export const fetchVideosByCategory = async (
  category: string
): Promise<Video[]> => {
  const snapshot = await db
    .collection(COLLECTIONS.VIDEOS)
    .where('category', '==', category)
    .limit(20)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<Video, 'id'>),
  }));
};

// Incrémente les vues (utilisé par Accueil)
export const incrementViews = async (videoId: string): Promise<void> => {
  await db
    .collection(COLLECTIONS.VIDEOS)
    .doc(videoId)
    .update({
      viewsCount: firestore.FieldValue.increment(1),
    });
};

// Like une vidéo (utilisé par Accueil)
export const likeVideo = async (videoId: string, uid: string): Promise<void> => {
  const batch = db.batch();

  // Ajoute dans la collection likes
  const likeRef = db
    .collection(COLLECTIONS.LIKES)
    .doc(`${uid}_${videoId}`);

  // Incrémente le compteur de likes
  const videoRef = db
    .collection(COLLECTIONS.VIDEOS)
    .doc(videoId);

  batch.set(likeRef, { uid, videoId, createdAt: Date.now() });
  batch.update(videoRef, {
    likesCount: firestore.FieldValue.increment(1),
  });

  await batch.commit();
};

// Unlike une vidéo (utilisé par Accueil)
export const unlikeVideo = async (videoId: string, uid: string): Promise<void> => {
  const batch = db.batch();

  const likeRef = db
    .collection(COLLECTIONS.LIKES)
    .doc(`${uid}_${videoId}`);

  const videoRef = db
    .collection(COLLECTIONS.VIDEOS)
    .doc(videoId);

  batch.delete(likeRef);
  batch.update(videoRef, {
    likesCount: firestore.FieldValue.increment(-1),
  });

  await batch.commit();
};

// Vérifie si l'utilisateur a liké une vidéo
export const checkIfLiked = async (
  videoId: string,
  uid: string
): Promise<boolean> => {
  const doc = await db
    .collection(COLLECTIONS.LIKES)
    .doc(`${uid}_${videoId}`)
    .get();
  return doc.exists();
};