// src/screens/ProfileScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, ActivityIndicator, Alert,
  TextInput, Modal, ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useProfile } from '../hooks/useProfile';

const { width } = Dimensions.get('window');
const ITEM_SIZE = width / 3 - 2;

const ProfileScreen = () => {
  const { profile, myVideos, likedVideos, loading, error, editProfile } = useProfile();
  const [activeTab, setActiveTab] = useState<'my' | 'liked'>('my');
  const [modalVisible, setModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);

  const openEditModal = () => {
    setNewUsername(profile?.username || '');
    setNewBio(profile?.bio || '');
    setNewAvatarUri(null);
    setModalVisible(true);
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, response => {
      if (response.assets && response.assets[0]?.uri) {
        setNewAvatarUri(response.assets[0].uri);
      }
    });
  };

  const saveProfile = async () => {
    if (!newUsername.trim()) {
      Alert.alert('Erreur', "Le nom d'utilisateur ne peut pas être vide.");
      return;
    }
    await editProfile({
      username: newUsername,
      bio: newBio,
      ...(newAvatarUri ? { photoURL: newAvatarUri } : {}),
    });
    setModalVisible(false);
    Alert.alert('Succès', 'Profil mis à jour !');
  };

  // Affiche le chargement
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FE2C55" size="large" />
      </View>
    );
  }

  // Affiche l'erreur si problème Firestore
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#FE2C55', textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  const videos = activeTab === 'my' ? myVideos : likedVideos;

  const avatarSource = newAvatarUri
    ? { uri: newAvatarUri }
    : profile?.photoURL
    ? { uri: profile.photoURL }
    : require('../assets/default-avatar.png');

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>

          {/* Photo de profil */}
          <Image source={avatarSource} style={styles.avatar} />

          {/* Nom d'utilisateur */}
          <Text style={styles.username}>
            @{profile?.username || 'utilisateur'}
          </Text>

          {/* Bio — affichée ici dans le header */}
          <Text style={styles.bio}>
            {profile?.bio || 'Aucune bio'}
          </Text>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {profile?.followingCount || 0}
              </Text>
              <Text style={styles.statLabel}>Abonnements</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {profile?.followersCount || 0}
              </Text>
              <Text style={styles.statLabel}>Abonnés</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {profile?.videosCount || 0}
              </Text>
              <Text style={styles.statLabel}>Vidéos</Text>
            </View>
          </View>

          {/* Bouton modifier */}
          <TouchableOpacity style={styles.editBtn} onPress={openEditModal}>
            <Text style={styles.editBtnText}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>

        {/* Onglets */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'my' && styles.tabActive]}
            onPress={() => setActiveTab('my')}>
            <Text style={styles.tabIcon}>▦</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'liked' && styles.tabActive]}
            onPress={() => setActiveTab('liked')}>
            <Text style={styles.tabIcon}>♥</Text>
          </TouchableOpacity>
        </View>

        {/* Grille vidéos */}
        <FlatList
          data={videos}
          keyExtractor={item => item.id}
          numColumns={3}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.videoThumb}>
              <Image
                source={{ uri: item.thumbnailURL }}
                style={styles.thumbImage}
              />
              <Text style={styles.viewCount}>▶ {item.viewsCount}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {activeTab === 'my' ? 'Aucune vidéo postée' : 'Aucune vidéo likée'}
            </Text>
          }
        />
      </ScrollView>

      {/* Modal modifier profil */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Modifier le profil</Text>

            {/* Photo */}
            <TouchableOpacity onPress={pickImage} style={styles.avatarPicker}>
              <Image
                source={
                  newAvatarUri
                    ? { uri: newAvatarUri }
                    : profile?.photoURL
                    ? { uri: profile.photoURL }
                    : require('../assets/default-avatar.png')
                }
                style={styles.avatarPreview}
              />
              <Text style={styles.changePhotoText}>Changer la photo</Text>
            </TouchableOpacity>

            {/* Nom */}
            <TextInput
              style={styles.modalInput}
              placeholder="Nom d'utilisateur"
              placeholderTextColor="#666"
              value={newUsername}
              onChangeText={setNewUsername}
            />

            {/* Bio */}
            <TextInput
              style={[styles.modalInput, styles.bioInput]}
              placeholder="Bio"
              placeholderTextColor="#666"
              value={newBio}
              onChangeText={setNewBio}
              multiline
            />

            <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
              <Text style={styles.saveBtnText}>Sauvegarder</Text>
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
  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#333', marginBottom: 10 },
  username: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 4 },

  // Bio affichée sous le nom
  bio: { color: '#888', fontSize: 14, textAlign: 'center', paddingHorizontal: 32, marginBottom: 16 },

  stats: { flexDirection: 'row', marginBottom: 16 },
  statItem: { alignItems: 'center', marginHorizontal: 20 },
  statNumber: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  statLabel: { color: '#888', fontSize: 12, marginTop: 2 },
  editBtn: { borderWidth: 1, borderColor: '#444', borderRadius: 6, paddingHorizontal: 40, paddingVertical: 8 },
  editBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#222' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#FE2C55' },
  tabIcon: { color: '#FFF', fontSize: 20 },
  videoThumb: { width: ITEM_SIZE, height: ITEM_SIZE, margin: 1, backgroundColor: '#1A1A1A' },
  thumbImage: { width: '100%', height: '100%' },
  viewCount: { position: 'absolute', bottom: 4, left: 4, color: '#FFF', fontSize: 11 },
  empty: { color: '#888', textAlign: 'center', marginTop: 40, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 24 },
  modalBox: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 24 },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  avatarPicker: { alignItems: 'center', marginBottom: 20 },
  avatarPreview: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#333', marginBottom: 8 },
  changePhotoText: { color: '#25F4EE', fontSize: 14 },
  modalInput: {
    backgroundColor: '#2A2A2A', color: '#FFF', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    marginBottom: 14, borderWidth: 1, borderColor: '#333',
  },
  bioInput: { height: 80, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#FE2C55', borderRadius: 8, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  cancelText: { color: '#888', textAlign: 'center', marginTop: 14, fontSize: 14 },
});

export default ProfileScreen;