import { initializeApp } from 'firebase/app'
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey:            "AIzaSyD_L8EcGej4gE9R3Rv_1xk6EEtC7WJoX04",
  authDomain:        "tictoc-f89e9.firebaseapp.com",
  projectId:         "tictoc-f89e9",
  storageBucket:     "tictoc-f89e9.firebasestorage.app",
  messagingSenderId: "882115046596",
  appId:             "1:882115046596:android:5a07c1c1ca1f77de2fad91",
  databaseURL:       "https://tictoc-f89e9-default-rtdb.firebaseio.com/"
}

const app = initializeApp(firebaseConfig)

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
})
export const db = getFirestore(app)
export const realtimeDb = getDatabase(app)