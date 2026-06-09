import { db } from '../lib/firebase'
import {
  collection, addDoc, getDocs, deleteDoc,
  query, orderBy, limit, where, doc,
  serverTimestamp, updateDoc, increment
} from 'firebase/firestore'

// Add a comment to a video
export const ajouterCommentaire = async (userId, videoId, text) => {
  const commentRef = await addDoc(collection(db, 'comments'), {
    userId,
    videoId,
    text,
    createdAt: serverTimestamp()
  })

  // Increment comment count on the video
  await updateDoc(doc(db, 'videos', videoId), {
    commentsCount: increment(1)
  })

  return commentRef.id
}

// Load comments for a video
export const chargerCommentaires = async (videoId, limitCount = 50) => {
  const q = query(
    collection(db, 'comments'),
    where('videoId', '==', videoId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Delete a comment
export const supprimerCommentaire = async (commentId, videoId) => {
  await deleteDoc(doc(db, 'comments', commentId))

  await updateDoc(doc(db, 'videos', videoId), {
    commentsCount: increment(-1)
  })
}
