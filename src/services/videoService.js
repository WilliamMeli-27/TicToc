import { db, storage } from '../lib/firebase'
import {
  collection, addDoc, getDocs, query,
  orderBy, limit, serverTimestamp,
  updateDoc, doc, increment
} from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

// Uploader une vidéo
export const uploadVideo = async (userId, videoUri, description, hashtags) => {

  // 1 — Upload le fichier vidéo dans Storage
  const response  = await fetch(videoUri)
  const blob      = await response.blob()
  const videoRef  = ref(storage, `videos/${userId}/${Date.now()}.mp4`)

  // Suivi de la progression
  const uploadTask = uploadBytesResumable(videoRef, blob)

  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        console.log(`Upload : ${progress.toFixed(0)}%`)
      },
      reject,
      async () => {
        // 2 — Récupérer l'URL publique
        const videoUrl = await getDownloadURL(uploadTask.snapshot.ref)

        // 3 — Sauvegarder dans Firestore
        const docRef = await addDoc(collection(db, 'videos'), {
          userId,
          videoUrl,
          description,
          hashtags,
          thumbnail:     '',
          likesCount:    0,
          commentsCount: 0,
          sharesCount:   0,
          viewsCount:    0,
          isPublic:      true,
          createdAt:     serverTimestamp()
        })

        // 4 — Incrémenter le compteur de vidéos du user
        await updateDoc(doc(db, 'users', userId), {
          videosCount: increment(1)
        })

        resolve(docRef.id)
      }
    )
  })
}

// Charger le fil d'actualité (For You)
export const chargerVideos = async (limitCount = 10) => {
  const q = query(
    collection(db, 'videos'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}