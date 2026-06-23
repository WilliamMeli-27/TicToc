import { db } from '../lib/firebase'
import firestore from '@react-native-firebase/firestore';

// Suivre / Ne plus suivre
export const toggleFollow = async (followerId, followedId) => {
  const followId  = `${followerId}_${followedId}`
  const followRef = db.collection('follows').doc(followId)
  const followDoc = await followRef.get()

  if (followDoc.exists) {
    // Déjà abonné → se désabonner
    await followRef.delete()
    await db.collection('users').doc(followedId).update({ 
      followersCount: firestore.FieldValue.increment(-1) 
    })
    await db.collection('users').doc(followerId).update({ 
      followingCount: firestore.FieldValue.increment(-1) 
    })
    return false  // unfollowed
  } else {
    // Pas abonné → s'abonner
    await followRef.set({
      followerId,
      followedId,
      createdAt: firestore.FieldValue.serverTimestamp()
    })
    await db.collection('users').doc(followedId).update({ 
      followersCount: firestore.FieldValue.increment(1) 
    })
    await db.collection('users').doc(followerId).update({ 
      followingCount: firestore.FieldValue.increment(1) 
    })
    return true   // followed
  }
}
