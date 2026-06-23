// src/hooks/useFeed.ts
import { useState, useCallback } from 'react';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {
  fetchVideos,
  searchVideos,
  fetchVideosByCategory,
  incrementViews,
  likeVideo,
  unlikeVideo,
  checkIfLiked,
  Video,
} from '../services/videoService';

export const CATEGORIES = [
  'Tout',
  'Sport',
  'Musique',
  'Divertissement',
  'Education',
  'Cuisine',
  'Mode',
  'Voyage',
];

export const useFeed = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [lastDoc, setLastDoc] = useState<FirebaseFirestoreTypes.QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tout');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const uid = auth().currentUser?.uid || '';

  const loadVideos = useCallback(async (reset = false) => {
    if (loading && !reset) return;
    setLoading(true);
    try {
      const currentLastDoc = reset ? undefined : (lastDoc ?? undefined);
      const result = await fetchVideos(currentLastDoc);
      
      if (reset) {
        setVideos(result.videos);
      } else {
        setVideos(prev => [...prev, ...result.videos]);
      }
      
      setLastDoc(result.lastDoc);
      setHasMore(result.videos.length > 0);
    } catch (e) {
      console.error('loadVideos error:', e);
    } finally {
      setLoading(false);
    }
  }, [loading, lastDoc]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setActiveCategory('Tout');
      await loadVideos(true);
      return;
    }
    try {
      setSearching(true);
      const results = await searchVideos(query);
      setVideos(results);
      setHasMore(false);
    } catch (e) {
      console.error('search error:', e);
    } finally {
      setSearching(false);
    }
  }, [loadVideos]);

  const handleCategory = useCallback(async (category: string) => {
    setActiveCategory(category);
    setSearchQuery('');
    try {
      setLoading(true);
      if (category === 'Tout') {
        const result = await fetchVideos();
        setVideos(result.videos);
        setLastDoc(result.lastDoc);
        setHasMore(result.videos.length > 0);
      } else {
        const results = await fetchVideosByCategory(category);
        setVideos(results);
        setHasMore(false);
      }
    } catch (e) {
      console.error('category error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleView = useCallback(async (videoId: string) => {
    try {
      await incrementViews(videoId);
      setVideos(prev =>
        prev.map(v =>
          v.id === videoId ? { ...v, viewsCount: v.viewsCount + 1 } : v
        )
      );
    } catch (e) {
      console.error('view error:', e);
    }
  }, []);

  const handleLike = useCallback(async (videoId: string) => {
    if (!uid) return;
    const isLiked = likedIds.has(videoId);
    try {
      if (isLiked) {
        await unlikeVideo(videoId, uid);
        setLikedIds(prev => {
          const next = new Set(prev);
          next.delete(videoId);
          return next;
        });
        setVideos(prev =>
          prev.map(v =>
            v.id === videoId ? { ...v, likesCount: v.likesCount - 1 } : v
          )
        );
      } else {
        await likeVideo(videoId, uid);
        setLikedIds(prev => {
          const next = new Set(prev);
          next.add(videoId);
          return next;
        });
        setVideos(prev =>
          prev.map(v =>
            v.id === videoId ? { ...v, likesCount: v.likesCount + 1 } : v
          )
        );
      }
    } catch (e) {
      console.error('like error:', e);
    }
  }, [uid, likedIds]);

  const checkLiked = useCallback(async (videoId: string) => {
    if (!uid) return;
    const liked = await checkIfLiked(videoId, uid);
    if (liked) {
      setLikedIds(prev => {
        const next = new Set(prev);
        next.add(videoId);
        return next;
      });
    }
  }, [uid]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setLastDoc(null);
    setHasMore(true);
    setActiveCategory('Tout');
    setSearchQuery('');
    await loadVideos(true);
    setRefreshing(false);
  }, [loadVideos]);

  return {
    videos,
    loading,
    refreshing,
    searching,
    hasMore,
    activeCategory,
    searchQuery,
    likedIds,
    loadVideos,
    handleSearch,
    handleCategory,
    handleView,
    handleLike,
    checkLiked,
    refresh,
  };
};
