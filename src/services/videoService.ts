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
  favoritesCount: number;
}

const PAGE_SIZE = 10;

// Convertit l'URL Cloudinary en URL de streaming HLS (.m3u8)
// Cloudinary génère automatiquement un flux HLS pour toute vidéo uploadée
export const toStreamingUrl = (videoUrl: string): string => {
  if (!videoUrl) return '';
  // Si c'est déjà une URL HLS ou non-Cloudinary, on la retourne telle quelle
  if (videoUrl.includes('.m3u8') || !videoUrl.includes('cloudinary.com')) {
    return videoUrl;
  }
  // Transforme l'URL MP4 Cloudinary en HLS :
  // https://res.cloudinary.com/cloud/video/upload/video.mp4
  // → https://res.cloudinary.com/cloud/video/upload/sp_hd/video.m3u8
  return videoUrl
    .replace('/video/upload/', '/video/upload/sp_hd/')
    .replace(/\.(mp4|mov|avi|mkv)$/, '.m3u8');
};

const toTimestamp = (val: any): number => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (val?.toMillis) return val.toMillis();
  return 0;
};

const mapDocToVideo = (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot): Video => {
  const data = doc.data();
  return {
    id: doc.id,
    publicId: data.publicId ?? '',
    videoUrl: data.videoUrl ?? '',
    thumbnailURL: data.thumbnailURL ?? '',
    uploaderUid: data.uploaderUid ?? '',
    uploaderUsername: data.uploaderUsername ?? 'utilisateur',
    uploaderAvatar: data.uploaderAvatar ?? null,
    caption: data.caption ?? '',
    category: data.category ?? 'Tout',
    duration: typeof data.duration === 'number' ? data.duration : Number(data.duration) || 0,
    likesCount: data.likesCount ?? 0,
    commentsCount: data.commentsCount ?? 0,
    viewsCount: data.viewsCount ?? 0,
    createdAt: toTimestamp(data.createdAt),
    favoritesCount: data.favoritesCount ?? 0,
  };
};

export const fetchVideos = async (
  lastDoc?: FirebaseFirestoreTypes.QueryDocumentSnapshot
): Promise<{ videos: Video[]; lastDoc: FirebaseFirestoreTypes.QueryDocumentSnapshot | null }> => {
  try {
    let query = db
      .collection(COLLECTIONS.VIDEOS)
      .orderBy('createdAt', 'desc')
      .limit(PAGE_SIZE);

    if (lastDoc) query = query.startAfter(lastDoc);

    const snapshot = await query.get();
    if (snapshot.empty) return { videos: [], lastDoc: null };

    const videos = snapshot.docs.map(mapDocToVideo);
    return { videos, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
  } catch (error) {
    console.error('fetchVideos error:', error);
    throw error;
  }
};

export const searchVideos = async (query: string): Promise<Video[]> => {
  if (!query.trim()) return [];
  try {
    const snapshot = await db
      .collection(COLLECTIONS.VIDEOS)
      .where('caption', '>=', query)
      .where('caption', '<=', query + '\uf8ff')
      .limit(20)
      .get();
    return snapshot.docs.map(mapDocToVideo);
  } catch (error) {
    console.error('searchVideos error:', error);
    return [];
  }
};

export const fetchVideosByCategory = async (category: string): Promise<Video[]> => {
  try {
    const snapshot = await db
      .collection(COLLECTIONS.VIDEOS)
      .where('category', '==', category)
      .limit(20)
      .get();
    return snapshot.docs.map(mapDocToVideo);
  } catch (error) {
    console.error('fetchVideosByCategory error:', error);
    return [];
  }
};

export const incrementViews = async (videoId: string): Promise<void> => {
  try {
    await db.collection(COLLECTIONS.VIDEOS).doc(videoId).update({
      viewsCount: firestore.FieldValue.increment(1),
    });
  } catch (error) {
    console.warn('incrementViews error:', error);
  }
};

export const likeVideo = async (videoId: string, uid: string): Promise<void> => {
  const batch = db.batch();
  batch.set(db.collection(COLLECTIONS.LIKES).doc(`${uid}_${videoId}`), {
    uid, videoId, createdAt: Date.now(),
  });
  batch.update(db.collection(COLLECTIONS.VIDEOS).doc(videoId), {
    likesCount: firestore.FieldValue.increment(1),
  });
  await batch.commit();
};

export const unlikeVideo = async (videoId: string, uid: string): Promise<void> => {
  const batch = db.batch();
  batch.delete(db.collection(COLLECTIONS.LIKES).doc(`${uid}_${videoId}`));
  batch.update(db.collection(COLLECTIONS.VIDEOS).doc(videoId), {
    likesCount: firestore.FieldValue.increment(-1),
  });
  await batch.commit();
};

export const checkIfLiked = async (videoId: string, uid: string): Promise<boolean> => {
  try {
    const doc = await db.collection(COLLECTIONS.LIKES).doc(`${uid}_${videoId}`).get();
    return doc.exists();
  } catch {
    return false;
  }
};