import { useState, useEffect } from 'react';
import { db, COLLECTIONS } from '../lib/firebase';
import firestore from '@react-native-firebase/firestore';
import { firebaseAuth } from '../lib/firebase';

export const useVideoActions = (videoId: string) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const uid = firebaseAuth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;

    // Écoute en temps réel le nombre de likes
    const unsubVideo = db
      .collection(COLLECTIONS.VIDEOS)
      .doc(videoId)
      .onSnapshot(snap => {
        setLikesCount(snap.data()?.likesCount ?? 0);
      });

    // Vérifie si l'utilisateur a déjà liké
    const likeId = `${uid}_${videoId}`;
    const unsubLike = db
      .collection(COLLECTIONS.LIKES)
      .doc(likeId)
      .onSnapshot(snap => setLiked(snap.exists));

    return () => {
      unsubVideo();
      unsubLike();
    };
  }, [videoId, uid]);

  const toggleLike = async () => {
    if (!uid) return;
    const likeId = `${uid}_${videoId}`;
    const likeRef = db.collection(COLLECTIONS.LIKES).doc(likeId);
    const videoRef = db.collection(COLLECTIONS.VIDEOS).doc(videoId);

    if (liked) {
      await likeRef.delete();
      await videoRef.update({ likesCount: firestore.FieldValue.increment(-1) });
    } else {
      await likeRef.set({ userId: uid, videoId, createdAt: Date.now() });
      await videoRef.update({ likesCount: firestore.FieldValue.increment(1) });

      // Notification pour le propriétaire
      await db.collection(COLLECTIONS.NOTIFICATIONS).add({
        type: 'like',
        fromUid: uid,
        videoId,
        createdAt: Date.now(),
      });
    }
  };

  return { liked, likesCount, toggleLike };
};