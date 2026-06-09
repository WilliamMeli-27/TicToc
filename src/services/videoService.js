import { db } from '../lib/firebase'
import {
  collection, addDoc, getDocs, getDoc, query,
  orderBy, limit, serverTimestamp,
  updateDoc, doc, increment, where, deleteDoc
} from 'firebase/firestore'
import { uploadVideoToCloudinary, getVideoThumbnail } from '../lib/cloudinary'

// Upload a video via Cloudinary then save metadata to Firestore
export const uploadVideo = async (userId, videoUri, description, hashtags, onProgress) => {
  // 1 — Upload to Cloudinary
  const cloudinaryResult = await uploadVideoToCloudinary(videoUri, (progress) => {
    console.log(`Upload : ${progress}%`)
    onProgress?.(progress)
  })

  // 2 — Generate thumbnail URL from Cloudinary
  const thumbnail = getVideoThumbnail(cloudinaryResult.url)

  // 3 — Save metadata to Firestore
  const docRef = await addDoc(collection(db, 'videos'), {
    userId,
    videoUrl:      cloudinaryResult.url,
    cloudinaryId:  cloudinaryResult.publicId,
    description,
    hashtags,
    thumbnail,
    duration:      cloudinaryResult.duration,
    likesCount:    0,
    commentsCount: 0,
    sharesCount:   0,
    viewsCount:    0,
    isPublic:      true,
    createdAt:     serverTimestamp()
  })

  // 4 — Increment user video count
  await updateDoc(doc(db, 'users', userId), {
    videosCount: increment(1)
  })

  return docRef.id
}

// Load "For You" feed
export const chargerVideos = async (limitCount = 10) => {
  const q = query(
    collection(db, 'videos'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Load videos by a specific user
export const chargerVideosByUser = async (userId, limitCount = 20) => {
  const q = query(
    collection(db, 'videos'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Get a single video by ID
export const getVideo = async (videoId) => {
  const snapshot = await getDoc(doc(db, 'videos', videoId))
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() }
}

// Increment view count
export const incrementViewCount = async (videoId) => {
  await updateDoc(doc(db, 'videos', videoId), {
    viewsCount: increment(1)
  })
}

// Delete a video
export const deleteVideo = async (videoId, userId) => {
  await deleteDoc(doc(db, 'videos', videoId))
  await updateDoc(doc(db, 'users', userId), {
    videosCount: increment(-1)
  })
}
