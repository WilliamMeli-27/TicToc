// src/hooks/useProfile.ts
import { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { UserProfile } from '../services/authService';
import {
  getProfile,
  updateProfile,
  getUserVideos,
  getLikedVideos,
  VideoItem,
} from '../services/profileService';

export const useProfile = (uid?: string) => {
  const currentUid = uid || auth().currentUser?.uid || '';

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myVideos, setMyVideos] = useState<VideoItem[]>([]);
  const [likedVideos, setLikedVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileData, videos, liked] = await Promise.all([
        getProfile(currentUid),
        getUserVideos(currentUid),
        getLikedVideos(currentUid),
      ]);
      setProfile(profileData);
      setMyVideos(videos);
      setLikedVideos(liked);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const editProfile = async (data: Partial<UserProfile>) => {
    try {
      await updateProfile(data);
      // Met à jour localement sans recharger
      setProfile(prev => prev ? { ...prev, ...data } : prev);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    if (currentUid) loadProfile();
  }, [currentUid]);

  return { profile, myVideos, likedVideos, loading, error, editProfile, reload: loadProfile };
};