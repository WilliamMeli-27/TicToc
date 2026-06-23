import { db } from '../lib/firebase'
import firestore from '@react-native-firebase/firestore';
import { uploadVideoToCloudinary, getVideoThumbnail } from '../lib/cloudinary'

// Upload a video via Cloudinary then save metadata to Firestore
export const uploadVideo = async (userId, videoUri, description, hashtags, onProgress) => {
  try {
    console.log(`Starting upload for user ${userId}, video: ${videoUri}`);
    
    // 1 — Upload to Cloudinary
    const cloudinaryResult = await uploadVideoToCloudinary(videoUri, (progress) => {
      onProgress?.(progress)
    })
    
    console.log('Cloudinary upload success:', cloudinaryResult.url);

    // 2 — Generate thumbnail URL from Cloudinary
    const thumbnail = getVideoThumbnail(cloudinaryResult.url)

    // 3 — Save metadata to Firestore
    const videoData = {
      userId,
      videoUrl:      cloudinaryResult.url,
      cloudinaryId:  cloudinaryResult.publicId,
      description:   description || '',
      hashtags:      hashtags || [],
      thumbnail:     thumbnail || '',
      duration:      cloudinaryResult.duration || 0,
      likesCount:    0,
      commentsCount: 0,
      sharesCount:   0,
      viewsCount:    0,
      isPublic:      true,
      createdAt:     firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('videos').add(videoData);
    console.log('Firestore metadata saved, docId:', docRef.id);

    // 4 — Increment user video count (using set with merge to be safe)
    await db.collection('users').doc(userId).set({
      videosCount: firestore.FieldValue.increment(1)
    }, { merge: true });

    return docRef.id
  } catch (error) {
    console.error('VideoService uploadVideo Error:', error);
    throw error;
  }
}

// Load "For You" feed
export const chargerVideos = async (limitCount = 10) => {
  try {
    console.log('Fetching videos from Firestore...');
    const snapshot = await db.collection('videos')
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get()
    
    console.log(`Fetched ${snapshot.docs.length} videos`);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (error) {
    console.error('VideoService chargerVideos Error:', error);
    throw error;
  }
}

// Load videos by a specific user
export const chargerVideosByUser = async (userId, limitCount = 20) => {
  try {
    const snapshot = await db.collection('videos')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get()
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (error) {
    console.error('VideoService chargerVideosByUser Error:', error);
    throw error;
  }
}

// Get a single video by ID
export const getVideo = async (videoId) => {
  const snapshot = await db.collection('videos').doc(videoId).get()
  if (!snapshot.exists) return null
  return { id: snapshot.id, ...snapshot.data() }
}

// Increment view count
export const incrementViewCount = async (videoId) => {
  await db.collection('videos').doc(videoId).update({
    viewsCount: firestore.FieldValue.increment(1)
  })
}

// Delete a video
export const deleteVideo = async (videoId, userId) => {
  await db.collection('videos').doc(videoId).delete()
  await db.collection('users').doc(userId).update({
    videosCount: firestore.FieldValue.increment(-1)
  })
}
