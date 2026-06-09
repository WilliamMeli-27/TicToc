import { db } from '../lib/firebase'
import {
  collection, addDoc, getDocs, query,
  orderBy, limit, where, doc,
  serverTimestamp, updateDoc
} from 'firebase/firestore'

// Create a notification
export const creerNotification = async (toUserId, fromUserId, type, data = {}) => {
  await addDoc(collection(db, 'notifications'), {
    toUserId,
    fromUserId,
    type,       // 'like' | 'follow' | 'comment' | 'mention' | 'system'
    data,
    isRead: false,
    createdAt: serverTimestamp()
  })
}

// Load notifications for a user
export const chargerNotifications = async (userId, limitCount = 30) => {
  const q = query(
    collection(db, 'notifications'),
    where('toUserId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Mark a notification as read
export const marquerCommeLu = async (notificationId) => {
  await updateDoc(doc(db, 'notifications', notificationId), {
    isRead: true
  })
}

// Mark all notifications as read
export const marquerToutCommeLu = async (userId) => {
  const q = query(
    collection(db, 'notifications'),
    where('toUserId', '==', userId),
    where('isRead', '==', false)
  )
  const snapshot = await getDocs(q)
  const updates = snapshot.docs.map(d =>
    updateDoc(doc(db, 'notifications', d.id), { isRead: true })
  )
  await Promise.all(updates)
}
