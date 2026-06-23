import { useState, useEffect } from 'react';
import { db, COLLECTIONS } from '../lib/firebase';
import firestore from '@react-native-firebase/firestore';
import { firebaseAuth } from '../lib/firebase';

export const useVideoActions = (videoId: string, uploaderUid: string) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [following, setFollowing] = useState(false);

  const uid = firebaseAuth.currentUser?.uid;
  const isOwnVideo = uid === uploaderUid;

  useEffect(() => {
    if (!uid) return;

    // Écoute likes en temps réel
    const unsubVideo = db
      .collection(COLLECTIONS.VIDEOS)
      .doc(videoId)
      .onSnapshot(snap => {
        setLikesCount(snap.data()?.likesCount ?? 0);
        setFavoritesCount(snap.data()?.favoritesCount ?? 0);
      });

    // Écoute si déjà liké
    const unsubLike = db
      .collection(COLLECTIONS.LIKES)
      .doc(`${uid}_${videoId}`)
      .onSnapshot(snap => setLiked(snap.exists));

    // Écoute si déjà en favori
    const unsubFav = db
      .collection(COLLECTIONS.FAVORITES)
      .doc(`${uid}_${videoId}`)
      .onSnapshot(snap => setFavorited(snap.exists));

    // Écoute si déjà abonné
    const unsubFollow = db
      .collection(COLLECTIONS.FOLLOWS)
      .doc(`${uid}_${uploaderUid}`)
      .onSnapshot(snap => setFollowing(snap.exists));

    return () => {
      unsubVideo();
      unsubLike();
      unsubFav();
      unsubFollow();
    };
  }, [videoId, uid, uploaderUid]);

  // Toggle like
  const toggleLike = async () => {
    if (!uid) return;
    const likeRef = db.collection(COLLECTIONS.LIKES).doc(`${uid}_${videoId}`);
    const videoRef = db.collection(COLLECTIONS.VIDEOS).doc(videoId);
    if (liked) {
      await likeRef.delete();
      await videoRef.update({ likesCount: firestore.FieldValue.increment(-1) });
    } else {
      await likeRef.set({ userId: uid, videoId, createdAt: Date.now() });
      await videoRef.update({ likesCount: firestore.FieldValue.increment(1) });
      await db.collection(COLLECTIONS.NOTIFICATIONS).add({
        type: 'like', fromUid: uid, toUid: uploaderUid,
        videoId, createdAt: Date.now(), read: false,
      });
    }
  };

  // Toggle favori
  const toggleFavorite = async () => {
    if (!uid) return;
    const favRef = db.collection(COLLECTIONS.FAVORITES).doc(`${uid}_${videoId}`);
    const videoRef = db.collection(COLLECTIONS.VIDEOS).doc(videoId);
    if (favorited) {
      await favRef.delete();
      await videoRef.update({ favoritesCount: firestore.FieldValue.increment(-1) });
    } else {
      await favRef.set({ userId: uid, videoId, createdAt: Date.now() });
      await videoRef.update({ favoritesCount: firestore.FieldValue.increment(1) });
    }
  };

  // Toggle follow
  const toggleFollow = async () => {
    if (!uid || isOwnVideo) return;
    const followId = `${uid}_${uploaderUid}`;
    const followRef = db.collection(COLLECTIONS.FOLLOWS).doc(followId);
    const targetRef = db.collection(COLLECTIONS.USERS).doc(uploaderUid);
    const meRef = db.collection(COLLECTIONS.USERS).doc(uid);

    if (following) {
      await followRef.delete();
      await targetRef.update({ followersCount: firestore.FieldValue.increment(-1) });
      await meRef.update({ followingCount: firestore.FieldValue.increment(-1) });
    } else {
      await followRef.set({
        followerId: uid, followedId: uploaderUid, createdAt: Date.now(),
      });
      await targetRef.update({ followersCount: firestore.FieldValue.increment(1) });
      await meRef.update({ followingCount: firestore.FieldValue.increment(1) });
      await db.collection(COLLECTIONS.NOTIFICATIONS).add({
        type: 'follow', fromUid: uid, toUid: uploaderUid,
        createdAt: Date.now(), read: false,
      });
    }
  };

  return {
    liked, likesCount, toggleLike,
    favorited, favoritesCount, toggleFavorite,
    following, toggleFollow, isOwnVideo,
  };
};