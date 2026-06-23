import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions,
  TouchableOpacity, Pressable, Image,
} from 'react-native';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { Video as VideoType, toStreamingUrl } from '../services/videoService';
import { useVideoActions } from '../hooks/useVideoActions';
import { incrementViews } from '../services/videoService';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Props {
  video: VideoType;
  isActive: boolean;
}

const VideoItem = ({ video, isActive }: Props) => {
  const videoRef = useRef<any>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [viewCounted, setViewCounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPauseIcon, setShowPauseIcon] = useState(false);

  const {
    liked, likesCount, toggleLike,
    favorited, favoritesCount, toggleFavorite,
    following, toggleFollow, isOwnVideo,
  } = useVideoActions(video.id, video.uploaderUid);

  const streamUrl = toStreamingUrl(video.videoUrl);

  const handleProgress = useCallback(({ currentTime }: { currentTime: number }) => {
    if (currentTime > 3 && !viewCounted) {
      setViewCounted(true);
      incrementViews(video.id);
    }
  }, [viewCounted, video.id]);

  const handleLoad = useCallback(() => setError(null), []);

  const handleError = useCallback((err: any) => {
    const msg = err?.error?.errorString ?? JSON.stringify(err);
    setError(msg);
  }, []);

  const handleVideoPress = useCallback(() => {
    setPaused(p => {
      setShowPauseIcon(true);
      setTimeout(() => setShowPauseIcon(false), 800);
      return !p;
    });
  }, []);

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  if (!video?.videoUrl || !video.videoUrl.startsWith('http')) {
    return (
      <View style={styles.container}>
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>⚠ URL invalide</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Lecteur */}
      <Video
        ref={videoRef}
        source={{ uri: error ? video.videoUrl : streamUrl }}
        style={styles.video}
        resizeMode="cover"
        repeat
        paused={!isActive || paused}
        muted={muted}
        onProgress={handleProgress}
        onLoad={handleLoad}
        onError={handleError}
        ignoreSilentSwitch="ignore"
        playInBackground={false}
        playWhenInactive={false}
        bufferConfig={{
          minBufferMs: 1500,
          maxBufferMs: 8000,
          bufferForPlaybackMs: 500,
          bufferForPlaybackAfterRebufferMs: 1000,
        }}
        reportBandwidth
      />

      {/* Zone tap pause — évite les boutons */}
      <Pressable style={styles.tapZone} onPress={handleVideoPress} />

      {/* Icône pause/play temporaire */}
      {showPauseIcon && (
        <View style={styles.pauseIcon} pointerEvents="none">
          <Text style={styles.pauseText}>{paused ? '▶' : ''}</Text>
        </View>
      )}

      {/* Gradient bas */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
        pointerEvents="none"
      />

      {/* Infos bas gauche */}
      <View style={styles.overlayLeft} pointerEvents="none">
        <Text style={styles.username}>@{video.uploaderUsername}</Text>
        <Text style={styles.caption} numberOfLines={2}>{video.caption}</Text>
      </View>

      {/* ===== COLONNE DROITE ===== */}
      <View style={styles.actions}>

        {/* Avatar + bouton follow */}
        <View style={styles.avatarContainer}>
          {video.uploaderAvatar ? (
            <Image
              source={{ uri: video.uploaderAvatar }}
              style={styles.avatarImg}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarLetter}>
                {video.uploaderUsername?.charAt(0).toUpperCase() ?? '?'}
              </Text>
            </View>
          )}
          {/* Bouton + pour s'abonner — masqué sur ses propres vidéos ou si déjà abonné */}
          {!isOwnVideo && (
            <TouchableOpacity
              style={[styles.followBtn, following && styles.followBtnActive]}
              onPress={toggleFollow}>
              <Text style={styles.followBtnText}>{following ? '✓' : '+'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Like */}
        <TouchableOpacity onPress={toggleLike} style={styles.actionBtn}>
          <Text style={[styles.actionIcon, liked && styles.likedIcon]}>♥</Text>
          <Text style={styles.actionCount}>{formatCount(likesCount)}</Text>
        </TouchableOpacity>

        {/* Commentaire */}
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{formatCount(video.commentsCount)}</Text>
        </TouchableOpacity>

        {/* Favori */}
        <TouchableOpacity onPress={toggleFavorite} style={styles.actionBtn}>
          <Text style={[styles.actionIcon, favorited && styles.favoritedIcon]}>
            {favorited ? '🔖' : '🔖'}
          </Text>
          <Text style={styles.actionCount}>{formatCount(favoritesCount)}</Text>
        </TouchableOpacity>

        {/* Mute */}
        <TouchableOpacity onPress={() => setMuted(m => !m)} style={styles.actionBtn}>
          <Text style={styles.actionIcon}>{muted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>

        {/* Partage */}
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>↗</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: SCREEN_W, height: SCREEN_H, backgroundColor: '#000' },
  video: { ...StyleSheet.absoluteFill },
  tapZone: {
    position: 'absolute',
    top: 0, left: 0,
    right: 90,   // laisse les boutons d'action
    bottom: 160, // laisse le texte bas
  },
  pauseIcon: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  pauseText: { fontSize: 72, color: 'rgba(255,255,255,0.85)' },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#000',
  },
  errorText: { color: '#FE2C55', fontSize: 14, textAlign: 'center' },
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 280 },
  overlayLeft: { position: 'absolute', bottom: 100, left: 16, right: 100 },
  username: { color: '#FFF', fontWeight: '700', fontSize: 15, marginBottom: 6 },
  caption: { color: '#FFF', fontSize: 13, lineHeight: 18 },

  // Colonne droite
  actions: {
    position: 'absolute',
    right: 10,
    bottom: 100,
    alignItems: 'center',
    gap: 16,
  },

  // Avatar + follow
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarImg: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2, borderColor: '#FFF',
  },
  avatarPlaceholder: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#FE2C55',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFF',
  },
  avatarLetter: { color: '#FFF', fontWeight: '700', fontSize: 18 },
  followBtn: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#FE2C55',
    justifyContent: 'center', alignItems: 'center',
    marginTop: -10, // chevauche légèrement l'avatar comme TikTok
    borderWidth: 1.5, borderColor: '#000',
  },
  followBtnActive: { backgroundColor: '#25F4EE' },
  followBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700', lineHeight: 16 },

  // Boutons action
  actionBtn: { alignItems: 'center' },
  actionIcon: { fontSize: 30, color: '#FFF' },
  likedIcon: { color: '#FE2C55' },
  favoritedIcon: { color: '#FFD700' }, // jaune doré quand favori
  actionCount: { color: '#FFF', fontSize: 12, marginTop: 2 },
});

export default VideoItem;