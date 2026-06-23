import React, { useState } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, ActivityIndicator, Alert,
  TextInput, Modal, ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useProfile } from '../hooks/useProfile';
import { uploadAvatar } from '../services/cloudinaryService';
import { logoutUser } from '../services/authService';

const { width } = Dimensions.get('window');
const ITEM_SIZE = width / 3 - 2;

const ProfileScreen = () => {
  const { profile, myVideos, likedVideos, loading, error, editProfile, reload } = useProfile();
  const [activeTab, setActiveTab] = useState<'my' | 'liked'>('my');
  const [modalVisible, setModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openEditModal = () => {
    setNewUsername(profile?.username ?? '');
    setNewBio(profile?.bio ?? '');
    setNewAvatarUri(null);
    setModalVisible(true);
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, response => {
      if (response.assets?.[0]?.uri) {
        setNewAvatarUri(response.assets[0].uri);
      }
    });
  };

  const saveProfile = async () => {
    if (!newUsername.trim()) {
      return Alert.alert('Erreur', "Le nom d'utilisateur ne peut pas être vide.");
    }
    setSaving(true);
    try {
      // Si nouvelle photo → upload vers Cloudinary
      if (newAvatarUri) {
        await uploadAvatar(newAvatarUri);
      }
      await editProfile({ username: newUsername, bio: newBio });
      setModalVisible(false);
      Alert.alert('✅ Succès', 'Profil mis à jour !');
    } catch (e: any) {
      Alert.alert('Erreur', e?.message ?? 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Déconnexion', 'Es-tu sûr de vouloir te déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: () => logoutUser() },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FE2C55" size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={reload} style={styles.retryBtn}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const videos = activeTab === 'my' ? myVideos : likedVideos;

  // Avatar — lettre initiale si pas de photo
  const avatarUri = profile?.photoURL ?? null;

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          {/* Bouton déconnexion */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>⎋</Text>
          </TouchableOpacity>

          {/* Avatar */}
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarLetter}>
                {profile?.username?.charAt(0).toUpperCase() ?? '?'}
              </Text>
            </View>
          )}

          <Text style={styles.username}>@{profile?.username ?? 'utilisateur'}</Text>
          <Text style={styles.bio}>{profile?.bio || 'Aucune bio'}</Text>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile?.followingCount ?? 0}</Text>
              <Text style={styles.statLabel}>Abonnements</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile?.followersCount ?? 0}</Text>
              <Text style={styles.statLabel}>Abonnés</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile?.videosCount ?? 0}</Text>
              <Text style={styles.statLabel}>Vidéos</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={openEditModal}>
            <Text style={styles.editBtnText}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>

        {/* Onglets */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'my' && styles.tabActive]}
            onPress={() => setActiveTab('my')}>
            <Text style={[styles.tabIcon, activeTab === 'my' && styles.tabIconActive]}>▦</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'liked' && styles.tabActive]}
            onPress={() => setActiveTab('liked')}>
            <Text style={[styles.tabIcon, activeTab === 'liked' && styles.tabIconActive]}>♥</Text>
          </TouchableOpacity>
        </View>

        {/* Grille vidéos */}
        {videos.length === 0 ? (
          <Text style={styles.empty}>
            {activeTab === 'my' ? 'Aucune vidéo postée' : 'Aucune vidéo likée'}
          </Text>
        ) : (
          <FlatList
            data={videos}
            keyExtractor={item => item.id}
            numColumns={3}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.videoThumb}>
                {item.thumbnailURL ? (
                  <Image source={{ uri: item.thumbnailURL }} style={styles.thumbImage} />
                ) : (
                  <View style={[styles.thumbImage, styles.thumbPlaceholder]}>
                    <Text style={styles.playIcon}>▶</Text>
                  </View>
                )}
                <View style={styles.thumbOverlay}>
                  <Text style={styles.viewCount}>▶ {item.viewsCount ?? 0}</Text>
                </View>
              </View>
            )}
          />
        )}
      </ScrollView>

      {/* Modal modifier profil */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Modifier le profil</Text>

            <TouchableOpacity onPress={pickImage} style={styles.avatarPicker}>
              {newAvatarUri ? (
                <Image source={{ uri: newAvatarUri }} style={styles.avatarPreview} />
              ) : avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarPreview} />
              ) : (
                <View style={[styles.avatarPreview, styles.avatarPlaceholderSmall]}>
                  <Text style={styles.avatarLetter}>
                    {profile?.username?.charAt(0).toUpperCase() ?? '?'}
                  </Text>
                </View>
              )}
              <Text style={styles.changePhotoText}>Changer la photo</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.modalInput}
              placeholder="Nom d'utilisateur"
              placeholderTextColor="#666"
              value={newUsername}
              onChangeText={setNewUsername}
            />

            <TextInput
              style={[styles.modalInput, styles.bioInput]}
              placeholder="Bio"
              placeholderTextColor="#666"
              value={newBio}
              onChangeText={setNewBio}
              multiline
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnSaving]}
              onPress={saveProfile}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveBtnText}>Sauvegarder</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', paddingTop: 50, paddingBottom: 16, position: 'relative' },
  logoutBtn: { position: 'absolute', top: 50, right: 16 },
  logoutText: { color: '#888', fontSize: 22 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#333', marginBottom: 10 },
  avatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#FE2C55', justifyContent: 'center',
    alignItems: 'center', marginBottom: 10,
  },
  avatarLetter: { color: '#FFF', fontSize: 36, fontWeight: '700' },
  username: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  bio: { color: '#888', fontSize: 14, textAlign: 'center', paddingHorizontal: 32, marginBottom: 16 },
  stats: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  statItem: { alignItems: 'center', paddingHorizontal: 20 },
  statNumber: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  statLabel: { color: '#888', fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: '#2A2A2A' },
  editBtn: {
    borderWidth: 1, borderColor: '#444', borderRadius: 6,
    paddingHorizontal: 40, paddingVertical: 8,
  },
  editBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#222' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#FFF' },
  tabIcon: { color: '#555', fontSize: 20 },
  tabIconActive: { color: '#FFF' },
  videoThumb: {
    width: ITEM_SIZE, height: ITEM_SIZE,
    margin: 1, backgroundColor: '#1A1A1A',
  },
  thumbImage: { width: '100%', height: '100%' },
  thumbPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  thumbOverlay: { position: 'absolute', bottom: 4, left: 4 },
  viewCount: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  empty: { color: '#555', textAlign: 'center', marginTop: 48, fontSize: 14 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#1A1A1A', borderTopLeftRadius: 20,
    borderTopRightRadius: 20, padding: 24, paddingBottom: 40,
  },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  avatarPicker: { alignItems: 'center', marginBottom: 20 },
  avatarPreview: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#333', marginBottom: 8 },
  avatarPlaceholderSmall: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#FE2C55' },
  changePhotoText: { color: '#25F4EE', fontSize: 14 },
  modalInput: {
    backgroundColor: '#2A2A2A', color: '#FFF', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    marginBottom: 14, borderWidth: 1, borderColor: '#333',
  },
  bioInput: { height: 80, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: '#FE2C55', borderRadius: 8,
    paddingVertical: 13, alignItems: 'center', marginTop: 4,
  },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  cancelText: { color: '#888', textAlign: 'center', marginTop: 14, fontSize: 14 },
  errorText: { color: '#FE2C55', textAlign: 'center' },
  retryBtn: { marginTop: 16 },
  retryText: { color: '#FFF' },
  playIcon: { color: '#444', fontSize: 24 },
  saveBtnSaving: { opacity: 0.6 },
});

export default ProfileScreen;