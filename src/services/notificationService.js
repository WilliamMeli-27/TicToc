import { db } from '../lib/firebase'
import firestore from '@react-native-firebase/firestore';

// Create a notification
export const creerNotification = async (toUserId, fromUserId, type, data = {}) => {
  await db.collection('notifications').add({
    toUserId,
    fromUserId,
    type,       // 'like' | 'follow' | 'comment' | 'mention' | 'system'
    data,
    isRead: false,
    createdAt: firestore.FieldValue.serverTimestamp()
  })
}

// Load notifications for a user
export const chargerNotifications = async (userId, limitCount = 30) => {
  const snapshot = await db.collection('notifications')
    .where('toUserId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(limitCount)
    .get()
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Mark a notification as read
export const marquerCommeLu = async (notificationId) => {
  await db.collection('notifications').doc(notificationId).update({
    isRead: true
  })
}

// Mark all notifications as read
export const marquerToutCommeLu = async (userId) => {
  const snapshot = await db.collection('notifications')
    .where('toUserId', '==', userId)
    .where('isRead', '==', false)
    .get()
  
  const batch = db.batch()
  snapshot.docs.forEach(d => {
    batch.update(d.ref, { isRead: true })
  })
  await batch.commit()
}
