import { db } from '../lib/firebase'
import firestore from '@react-native-firebase/firestore';

// Get user profile
export const getUser = async (userId) => {
  const snapshot = await db.collection('users').doc(userId).get()
  if (!snapshot.exists) return null
  return { id: snapshot.id, ...snapshot.data() }
}

// Update user profile
export const updateUser = async (userId, data) => {
  await db.collection('users').doc(userId).update({
    ...data,
    updatedAt: firestore.FieldValue.serverTimestamp()
  })
}

// Update avatar URL
export const updateAvatar = async (userId, avatarUrl) => {
  await db.collection('users').doc(userId).update({
    avatar: avatarUrl,
    updatedAt: firestore.FieldValue.serverTimestamp()
  })
}
