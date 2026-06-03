import { auth, db } from '../lib/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

// Inscription
export const inscription = async (email, password, username) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)

  // Créer le profil dans Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid:            user.uid,
    email:          email,
    username:       username.toLowerCase(),
    displayName:    username,
    avatar:         '',
    bio:            '',
    followersCount: 0,
    followingCount: 0,
    likesCount:     0,
    videosCount:    0,
    isVerified:     false,
    createdAt:      serverTimestamp()
  })

  return user
}

// Connexion
export const connexion = async (email, password) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return user
}

// Déconnexion
export const deconnexion = () => signOut(auth)