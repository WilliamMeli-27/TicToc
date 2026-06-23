import { db } from '../lib/firebase'
import firestore from '@react-native-firebase/firestore';

// Add a comment to a video
export const ajouterCommentaire = async (userId, videoId, text) => {
  const commentRef = await db.collection('comments').add({
    userId,
    videoId,
    text,
    createdAt: firestore.FieldValue.serverTimestamp()
  })

  // Increment comment count on the video
  await db.collection('videos').doc(videoId).update({
    commentsCount: firestore.FieldValue.increment(1)
  })

  return commentRef.id
}

// Load comments for a video
export const chargerCommentaires = async (videoId, limitCount = 50) => {
  const snapshot = await db.collection('comments')
    .where('videoId', '==', videoId)
    .orderBy('createdAt', 'desc')
    .limit(limitCount)
    .get()
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Delete a comment
export const supprimerCommentaire = async (commentId, videoId) => {
  await db.collection('comments').doc(commentId).delete()

  await db.collection('videos').doc(videoId).update({
    commentsCount: firestore.FieldValue.increment(-1)
  })
}
