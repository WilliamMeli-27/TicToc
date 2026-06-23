import { db } from '../lib/firebase'
import firestore from '@react-native-firebase/firestore';

// Liker une vidéo
export const likerVideo = async (userId, videoId) => {
  const likeId  = `${userId}_${videoId}`
  const likeRef = db.collection('likes').doc(likeId)
  const likeDoc = await likeRef.get()

  if (likeDoc.exists) {
    // Déjà liké → on retire le like
    await likeRef.delete()
    await db.collection('videos').doc(videoId).update({ 
      likesCount: firestore.FieldValue.increment(-1) 
    })
    return false  // unliked
  } else {
    // Pas encore liké → on ajoute
    await likeRef.set({ 
      userId, 
      videoId, 
      createdAt: firestore.FieldValue.serverTimestamp() 
    })
    await db.collection('videos').doc(videoId).update({ 
      likesCount: firestore.FieldValue.increment(1) 
    })
    return true   // liked
  }
}

// Vérifier si l'utilisateur a liké une vidéo
export const estLike = async (userId, videoId) => {
  const likeDoc = await db.collection('likes').doc(`${userId}_${videoId}`).get()
  return likeDoc.exists
}
