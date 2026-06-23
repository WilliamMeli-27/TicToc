// Ce fichier est le point d'entrée unique pour tous les services Firebase
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';

export const firebaseAuth = auth();
export const db = firestore();
export const realtimeDb = database();

// Collections Firestore
export const COLLECTIONS = {
  USERS: 'users',
  VIDEOS: 'videos',
  LIKES: 'likes',
  COMMENTS: 'comments',
  FOLLOWS: 'follows',
  NOTIFICATIONS: 'notifications',
  LIVES: 'lives',
  FAVORITES: 'favorites',
};