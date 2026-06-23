import axios from 'axios';
import { CLOUDINARY_CONFIG } from '../lib/cloudinary';
import { db, COLLECTIONS } from '../lib/firebase';

// Upload une vidéo vers Cloudinary, puis sauvegarde le lien dans Firestore
export const uploadVideo = async (
  localFilePath: string,
  uploaderUid: string,
  caption: string
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', {
    uri: localFilePath,
    type: 'video/mp4',
    name: 'video.mp4',
  } as any);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('resource_type', 'video');

  const url = `${CLOUDINARY_CONFIG.baseUrl}/${CLOUDINARY_CONFIG.cloudName}/video/upload`;
  const response = await axios.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const { public_id, secure_url, duration } = response.data;

  // Sauvegarde dans Firestore
  const videoDoc = {
    publicId: public_id,
    videoUrl: secure_url,
    uploaderUid,
    caption,
    duration,
    likesCount: 0,
    commentsCount: 0,
    viewsCount: 0,
    createdAt: Date.now(),
  };

  await db.collection(COLLECTIONS.VIDEOS).add(videoDoc);

  return secure_url;
};

// Upload un avatar
export const uploadAvatar = async (
  localFilePath: string,
  uid: string
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', {
    uri: localFilePath,
    type: 'image/jpeg',
    name: 'avatar.jpg',
  } as any);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

  const url = `${CLOUDINARY_CONFIG.baseUrl}/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
  const response = await axios.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const { public_id } = response.data;

  // Met à jour Firestore avec le nouveau publicId
  await db.collection(COLLECTIONS.USERS).doc(uid).update({
    avatarPublicId: public_id,
  });

  return public_id;
};