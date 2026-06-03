import { db } from '../lib/firebase'
import {
  doc, setDoc, deleteDoc,
  getDoc, updateDoc, increment,
  serverTimestamp
} from 'firebase/firestore'

// Suivre / Ne plus suivre
export const toggleFollow = async (followerId, followedId) => {
  const followId  = `${followerId}_${followedId}`
  const followRef = doc(db, 'follows', followId)
  const followDoc = await getDoc(followRef)

  if (followDoc.exists()) {
    // Déjà abonné → se désabonner
    await deleteDoc(followRef)
    await updateDoc(doc(db, 'users', followedId), { followersCount: increment(-1) })
    await updateDoc(doc(db, 'users', followerId), { followingCount: increment(-1) })
    return false  // unfollowed
  } else {
    // Pas abonné → s'abonner
    await setDoc(followRef, {
      followerId,
      followedId,
      createdAt: serverTimestamp()
    })
    await updateDoc(doc(db, 'users', followedId), { followersCount: increment(1) })
    await updateDoc(doc(db, 'users', followerId), { followingCount: increment(1) })
    return true   // followed
  }
}