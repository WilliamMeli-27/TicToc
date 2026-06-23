import { firebaseAuth, db, COLLECTIONS } from '../lib/firebase';
import { getImageUrl } from '../lib/cloudinary';

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  bio: string | null;
  photoURL: string | null;
  avatarPublicId: string | null;
  followersCount: number;
  followingCount: number;
  videosCount: number;
  createdAt: number;
}

// Inscription
export const registerUser = async (
  email: string,
  password: string,
  username: string
): Promise<void> => {
  const { user } = await firebaseAuth.createUserWithEmailAndPassword(email, password);

  // Crée le profil dans Firestore
  const profile: UserProfile = {
    uid: user.uid,
    username,
    email,
    photoURL: null,  
    avatarPublicId: null,
    followersCount: 0,
    followingCount: 0,
    videosCount: 0,
    createdAt: Date.now(),
  };

  await db.collection(COLLECTIONS.USERS).doc(user.uid).set(profile);
};

// Connexion
export const loginUser = async (
  email: string,
  password: string
): Promise<void> => {
  await firebaseAuth.signInWithEmailAndPassword(email, password);
};

// Déconnexion
export const logoutUser = async (): Promise<void> => {
  await firebaseAuth.signOut();
};

// Récupérer profil
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const doc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
  return doc.exists() ? (doc.data() as UserProfile) : null;
};