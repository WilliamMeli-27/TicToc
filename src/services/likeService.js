import { db } from '../lib/firebase'
import {
  doc, setDoc, deleteDoc,
  getDoc, updateDoc, increment
} from 'firebase/firestore'

// Liker une vidéo
export const likerVideo = async (userId, videoId) => {
  const likeId  = `${userId}_${videoId}`
  const likeRef = doc(db, 'likes', likeId)
  const likeDoc = await getDoc(likeRef)

  if (likeDoc.exists()) {
    // Déjà liké → on retire le like
    await deleteDoc(likeRef)
    await updateDoc(doc(db, 'videos', videoId), { likesCount: increment(-1) })
    return false  // unliked
  } else {
    // Pas encore liké → on ajoute
    await setDoc(likeRef, { userId, videoId, createdAt: new Date() })
    await updateDoc(doc(db, 'videos', videoId), { likesCount: increment(1) })
    return true   // liked
  }
}

// Vérifier si l'utilisateur a liké une vidéo
export const estLike = async (userId, videoId) => {
  const likeDoc = await getDoc(doc(db, 'likes', `${userId}_${videoId}`))
  return likeDoc.exists()
}