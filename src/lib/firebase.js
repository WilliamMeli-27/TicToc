import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey:            "...",
  authDomain:        "tictoc-f89e9.firebaseapp.com",
  projectId:         "tictoc-f89e9",
  storageBucket:     "tictoc-f89e9.appspot.com",
  messagingSenderId: "...",
  appId:             "...",
  databaseURL: "https://tictoc-f89e9-default-rtdb.firebaseio.com/"
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
