import React from 'react';
import { View, Text, Pressable, Image, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export interface Creator {
  id: string;
  username: string;
  avatar: string;
}

export interface VideoItemType {
  id: string;
  thumbnail: string;
  views: number;
  creator: Creator;
  aspectRatio: '9:16' | '9:12' | '9:14';
}

export interface ChallengeItemType {
  id: string;
  title: string;
  participants: string;
  thumbnail: string;
  variant: 'cyan' | 'pink';
}

export const CATEGORIES = ['Trending', 'Dance', 'Comedy', 'Tech', 'Music', 'Gaming'];

export const mockChallenges: ChallengeItemType[] = [
  {
    id: '1',
    title: '#CyberDance2024',
    participants: '1.2M Participating',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCEUdLBWbYZ6dMYrehq0azz9IrDCjWz5kRtW0KepUQ2aTwFP5t6e5nxwHMMnkw_XociU7Xtp6fQtVfnkKpQ_0DYoAdgUAkdt6_L7xhzt_Q_NuANJbovnQzdXEsnooqYm9jtAo_w6T26RKfC7MCe-VNdD0zicvwUOHRnZct7yltSRdWC7jde4cL3THIo6eKqrp9Yl7eQa-759x0EwDvDDlFvWPqY0hhO9iwgJjcxSuH6gAZ7KD0cjorm22LtgNuDKlTppWdiQAZolQn',
    variant: 'cyan',
  },
  {
    id: '2',
    title: '#RetroGamingVibe',
    participants: '850K Participating',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLiznwNRn_-L4AfMzj5Z6AmcEXdmnuTaoA24inP46SMhlYb8xlf9TgnYKTmtDEsmH0p-LIxGUXYSAFrqsGeSi1J2uhNx_39bcw4PBRKyoLQdRa-PU4nzC5oFcQTfHc6LGe4H9qAFEUheHiAhGotB5h0tOlKxM_CZP9QEqcob2blNioQ8snbXXjh6gU2L1upolFQ0TXD1BvHcRRxSgIIm_1OIoz25EJIpaN9F9Wh5AJHG6k13g1MpaGTTRjKN7M525OhEeDJVJlIStV',
    variant: 'pink',
  },
];

export const mockVideos: VideoItemType[] = [
  {
    id: '1',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6zQEh2NtjtUGwp0U5MHPa8gqo-1U4YoP0giD0-wzCWoTdJqXnZ4E2KwrJRkbQGFRDn3Q4pY_R8TZ1T2sTx6Isdnb-VG0oaaas62x8t1AATMYphZwaxG5e3p38r_faSY-RNhpPBhX1dVlJLYJPTXevd--0XUzfyAvMVj0k9-uJndX4pEQgPSQsJG__Ulcyt0TlsYnXoqp-Wft-a7QAgxUsQewY6jFXOw0TFUdJA1y_T_89fZCD-XteTa_sNaVagf4uB2XylY4lSo5X',
    views: 4200000,
    creator: { id: 'c1', username: '@alex_vibe', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2Q_-eQgH4KeVkDSqhXiZaE4AFLSZbkH_4zZUJDnUeGTedy79nFphNoP6ZA6OKZdFlzifMdHHsgDwvO8z2osfYS2sMRraAAjeq8bb091zxto0YezhqFzJAogXwpRu9hhHfhAC3380jiaIhKCoh4MGh8yZ5jSAt-U_78auaBnTJT4y_N8C9ZUCpLIdTwuTIwabxvNbIQVbU9uCbfPRfYHdzzLGyEqeMXxyv6mElGm3d-b1IgG4ozYvRKbSi0tsD_A1IuJfOYnusURE1' },
    aspectRatio: '9:16',
  },
  {
    id: '2',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClfG5AQyHzoup8dUXnuRcFc1gzyOqst4S53gxr-s5OCRCEWsC779x5OWuO_AEPtvrPFVT4c_jgMwZNEHsSofEQxSA42xIHb3pjq61pvHMGkKQqEnHjUzGRKo_sh53d7sQURcNJufUL9862upCOyGty3lvsVGIFA0LpJVNzs72BMbGBjNvMmGD2yKWk4kVxZPlaFsYl8ebTNed1y1Zdr-clsBFPO-XuuD0sMys84q1yczwwthfEjEB0rb9IYh-35dVnwuu8eXHD6kz1',
    views: 1800000,
    creator: { id: 'c2', username: '@maya_dance', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfcfivmbd7rcMceWmN1B4dsRAD-TfSlRLy42rlMdh3_Ff4Pk9CRmqxqvZgBwTz-MKkt4Imbv6mF1gWCei1ix4mI7cxWaBKbTVhLHLom9yS3erTTomeWWTTlHynBzOVb31NWHXTCATEquVRUglrr0RewzdgLI4R2LH0gtfppWPNTjgSHguxjkg6NpUsQ1eR0G_W-chhQqgLek1U1RcTcTjlaFwcOi9dyMXp9cBF8lSzuAyJCelEeCRNABDc1LtENodE4SB91gX29QWC' },
    aspectRatio: '9:12',
  },
];

export const VideoItem: React.FC<{ item: VideoItemType; onPress: (id: string) => void }> = ({ item, onPress }) => {
  const getAspectRatio = () => {
    switch (item.aspectRatio) {
      case '9:12': return 9 / 12;
      case '9:14': return 9 / 14;
      default: return 9 / 16;
    }
  };

  return (
    <Pressable style={[styles.videoItem, { aspectRatio: getAspectRatio() }]} onPress={() => onPress(item.id)}>
      <Image source={{ uri: item.thumbnail }} style={styles.videoThumbnail} resizeMode="cover" />
      <LinearGradient colors={['rgba(0,0,0,0.2)', 'transparent', 'rgba(0,0,0,0.6)']} style={styles.videoOverlay} />
      <View style={styles.creatorInfo}>
        <Image source={{ uri: item.creator.avatar }} style={styles.creatorAvatar} />
        <Text style={styles.creatorUsername}>{item.creator.username}</Text>
      </View>
    </Pressable>
  );
};

export const ChallengeItem: React.FC<{ item: ChallengeItemType; onPress: (id: string) => void }> = ({ item, onPress }) => {
  const isCyan = item.variant === 'cyan';
  return (
    <Pressable style={[styles.challengeCard, isCyan ? styles.cyanBorder : styles.pinkBorder]} onPress={() => onPress(item.id)}>
      <Image source={{ uri: item.thumbnail }} style={styles.challengeImage} resizeMode="cover" />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.challengeOverlay}>
        <Text style={[styles.challengeTitle, isCyan ? styles.cyanText : styles.pinkText]}>{item.title}</Text>
        <Text style={styles.challengeParticipants}>{item.participants}</Text>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  videoItem: { borderRadius: 12, overflow: 'hidden', position: 'relative' },
  videoThumbnail: { width: '100%', height: '100%' },
  videoOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  creatorInfo: { position: 'absolute', bottom: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  creatorAvatar: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.3)' },
  creatorUsername: { fontSize: 12, lineHeight: 16, color: '#ffffff' },
  challengeCard: { width: 280, height: 160, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  cyanBorder: { borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.5)' },
  pinkBorder: { borderWidth: 1, borderColor: 'rgba(255, 177, 195, 0.5)' },
  challengeImage: { width: '100%', height: '100%' },
  challengeOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  challengeTitle: { fontSize: 12, lineHeight: 16, fontWeight: '600', marginBottom: 4 },
  cyanText: { color: '#7df4ff' },
  pinkText: { color: '#ffb1c3' },
  challengeParticipants: { fontSize: 14, lineHeight: 20, color: 'rgba(255, 255, 255, 0.8)' },
});