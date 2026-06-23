import axios from 'axios';
import { CLOUDINARY_CONFIG } from '../lib/cloudinary';
import { db, COLLECTIONS } from '../lib/firebase';
import { firebaseAuth } from '../lib/firebase';
import firestore from '@react-native-firebase/firestore';

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

// Upload vidéo → Cloudinary → Firestore
export const uploadVideo = async (
  localFilePath: string,
  caption: string,
  onProgress?: (progress: UploadProgress) => void,
  category: string = 'Divertissement',
): Promise<string> => {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) throw new Error('Utilisateur non connecté');

  const userDoc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
  const userData = userDoc.data();

  const formData = new FormData();
  formData.append('file', {
    uri: localFilePath,
    type: 'video/mp4',
    name: `video_${Date.now()}.mp4`,
  } as any);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('resource_type', 'video');
  formData.append('folder', 'tictoc/videos');

  const url = `${CLOUDINARY_CONFIG.baseUrl}/${CLOUDINARY_CONFIG.cloudName}/video/upload`;

  const response = await axios.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percent: Math.round((e.loaded / e.total) * 100),
        });
      }
    },
  });

  const { public_id, secure_url, duration } = response.data;

  await db.collection(COLLECTIONS.VIDEOS).add({
    publicId: public_id,
    videoUrl: secure_url,
    thumbnailURL: '',
    uploaderUid: uid,
    uploaderUsername: userData?.username ?? 'utilisateur',
    uploaderAvatar: userData?.avatarPublicId ?? null,
    caption,
    category,
    duration: Math.round(duration ?? 0),
    likesCount: 0,
    commentsCount: 0,
    viewsCount: 0,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  await db.collection(COLLECTIONS.USERS).doc(uid).update({
    videosCount: firestore.FieldValue.increment(1),
  });

  return secure_url;
};

// Upload avatar → Cloudinary → Firestore
export const uploadAvatar = async (
  localFilePath: string,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string> => {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) throw new Error('Utilisateur non connecté');

  const formData = new FormData();
  formData.append('file', {
    uri: localFilePath,
    type: 'image/jpeg',
    name: `avatar_${uid}.jpg`,
  } as any);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', 'tictoc/avatars');

  const url = `${CLOUDINARY_CONFIG.baseUrl}/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

  const response = await axios.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percent: Math.round((e.loaded / e.total) * 100),
        });
      }
    },
  });

  const { public_id, secure_url } = response.data;

  await db.collection(COLLECTIONS.USERS).doc(uid).update({
    avatarPublicId: public_id,
    photoURL: secure_url,
  });

  return secure_url;
};