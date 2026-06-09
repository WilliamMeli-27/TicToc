import { db } from '../lib/firebase'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

// Get user profile
export const getUser = async (userId) => {
  const snapshot = await getDoc(doc(db, 'users', userId))
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() }
}

// Update user profile
export const updateUser = async (userId, data) => {
  await updateDoc(doc(db, 'users', userId), {
    ...data,
    updatedAt: serverTimestamp()
  })
}

// Update avatar URL
export const updateAvatar = async (userId, avatarUrl) => {
  await updateDoc(doc(db, 'users', userId), {
    avatar: avatarUrl,
    updatedAt: serverTimestamp()
  })
}
