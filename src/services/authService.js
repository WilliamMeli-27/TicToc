import { auth, db } from '../lib/firebase'
import firestore from '@react-native-firebase/firestore';

// Inscription
export const inscription = async (email, password, username) => {
  try {
    const { user } = await auth().createUserWithEmailAndPassword(email, password)

    // Créer le profil dans Firestore
    await db.collection('users').doc(user.uid).set({
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
      createdAt:      firestore.FieldValue.serverTimestamp()
    })

    return user
  } catch (error) {
    console.error('AuthService Inscription Error:', error);
    throw error;
  }
}

// Connexion
export const connexion = async (email, password) => {
  try {
    const { user } = await auth().signInWithEmailAndPassword(email, password)
    return user
  } catch (error) {
    console.error('AuthService Connexion Error:', error);
    throw error;
  }
}

// Déconnexion
export const deconnexion = () => auth().signOut()
