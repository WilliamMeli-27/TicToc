import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions,
  TouchableOpacity, TouchableWithoutFeedback,
} from 'react-native';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { Video as VideoType } from '../services/videoService';
import { useVideoActions } from '../hooks/useVideoActions';
import { incrementViews } from '../services/videoService';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Props {
  video: VideoType;
  isActive: boolean; // true = cet item est visible à l'écran
}

const VideoItem = ({ video, isActive }: Props) => {
  const videoRef = useRef<any>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [viewCounted, setViewCounted] = useState(false);
  const { liked, likesCount, toggleLike } = useVideoActions(video.id);

  const handleProgress = useCallback(({ currentTime }: { currentTime: number }) => {
    // Compte la vue après 3 secondes de lecture
    if (currentTime > 3 && !viewCounted) {
      setViewCounted(true);
      incrementViews(video.id);
    }
  }, [viewCounted, video.id]);

  const handleTap = () => setPaused(p => !p);
  const handleMute = () => setMuted(m => !m);

  return (
    <View style={styles.container}>
      {/* Lecteur vidéo */}
      <TouchableWithoutFeedback onPress={handleTap}>
        <Video
          ref={videoRef}
          source={{ uri: video.videoUrl }}
          style={styles.video}
          resizeMode="cover"
          repeat
          paused={!isActive || paused}
          muted={muted}
          onProgress={handleProgress}
          ignoreSilentSwitch="ignore"
          playInBackground={false}
          playWhenInactive={false}
        />
      </TouchableWithoutFeedback>

      {/* Icône pause/play au centre */}
      {paused && (
        <View style={styles.pauseIcon} pointerEvents="none">
          <Text style={styles.pauseText}>▶</Text>
        </View>
      )}

      {/* Gradient bas pour lisibilité du texte */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradient}
        pointerEvents="none"
      />

      {/* Overlay bas gauche : caption + username */}
      <View style={styles.overlayLeft} pointerEvents="none">
        <Text style={styles.username}>@{video.uploaderUsername}</Text>
        <Text style={styles.caption} numberOfLines={2}>{video.caption}</Text>
      </View>

      {/* Actions droite : like, comment, mute, share */}
      <View style={styles.actions}>
        {/* Like */}
        <TouchableOpacity onPress={toggleLike} style={styles.actionBtn}>
          <Text style={[styles.actionIcon, liked && styles.liked]}>♥</Text>
          <Text style={styles.actionCount}>{likesCount}</Text>
        </TouchableOpacity>

        {/* Commentaires */}
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{video.commentsCount}</Text>
        </TouchableOpacity>

        {/* Mute/Unmute */}
        <TouchableOpacity onPress={handleMute} style={styles.actionBtn}>
          <Text style={styles.actionIcon}>{muted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>

        {/* Partager */}
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>↗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_W,
    height: SCREEN_H,
    backgroundColor: '#000',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  pauseIcon: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseText: {
    fontSize: 60,
    color: 'rgba(255,255,255,0.7)',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  overlayLeft: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 80,
  },
  username: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  caption: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  actions: {
    position: 'absolute',
    right: 12,
    bottom: 100,
    alignItems: 'center',
    gap: 20,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  liked: {
    color: '#FE2C55',
  },
  actionCount: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 2,
  },
});

export default VideoItem;