import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey:            "...",
  authDomain:        "tictoc-f89e9.firebaseapp.com",
  projectId:         "tictoc-f89e9",
  storageBucket:     "tictoc-f89e9.appspot.com",
  messagingSenderId: "...",
  appId:             "...",
  databaseURL:       "https://tictoc-f89e9-default-rtdb.firebaseio.com/"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const realtimeDb = getDatabase(app)
