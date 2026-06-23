import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  ScrollView, Modal, FlatList,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { uploadVideo, UploadProgress } from '../services/cloudinaryService';

const CATEGORIES = [
  'Sport', 'Musique', 'Divertissement', 'Education',
  'Cuisine', 'Mode', 'Voyage', 'Gaming', 'Humour',
  'Beauté', 'Technologie', 'Animaux',
];

// Effets caméra appliqués via Cloudinary transformation (côté upload)
const CAMERA_EFFECTS = [
  { id: 'none',       label: 'Normal',     icon: '○',  transformation: '' },
  { id: 'viesus',     label: 'Améliorer',  icon: '✨', transformation: 'e_viesus_correct' },
  { id: 'beauty',     label: 'Beauté',     icon: '💄', transformation: 'e_viesus_correct/e_fill_light:30' },
  { id: 'vivid',      label: 'Vif',        icon: '🌈', transformation: 'e_vibrance:70/e_saturation:30' },
  { id: 'grayscale',  label: 'N&B',        icon: '⬛', transformation: 'e_grayscale' },
  { id: 'sepia',      label: 'Sépia',      icon: '🟤', transformation: 'e_sepia:80' },
];

const UploadScreen = () => {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Divertissement');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState(CAMERA_EFFECTS[0]);

  const pickFromGallery = () => {
    launchImageLibrary(
      { mediaType: 'video', videoQuality: 'high' },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (asset?.uri) setVideoUri(asset.uri);
      }
    );
  };

  const openCamera = () => setShowCamera(true);

  const recordWithCamera = () => {
    setShowCamera(false);
    launchCamera(
      {
        mediaType: 'video',
        videoQuality: 'high',
        durationLimit: 60,
        // L'effet sélectionné sera appliqué côté Cloudinary lors de l'upload
      },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (asset?.uri) setVideoUri(asset.uri);
      }
    );
  };

  const handleUpload = async () => {
    if (!videoUri) return Alert.alert('Erreur', 'Sélectionne une vidéo.');
    if (!caption.trim()) return Alert.alert('Erreur', 'Ajoute une description.');

    setUploading(true);
    setProgress(null);

    try {
      await uploadVideo(
        videoUri,
        caption.trim(),
        (p) => setProgress(p),
        category,
      );
      Alert.alert('✅ Succès', 'Vidéo publiée !');
      setVideoUri(null);
      setCaption('');
      setCategory('Divertissement');
      setProgress(null);
      setSelectedEffect(CAMERA_EFFECTS[0]);
    } catch (e: any) {
      console.error('Upload error:', e);
      Alert.alert('Erreur upload', e?.message ?? 'Une erreur est survenue');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nouvelle vidéo</Text>

      {/* Zone sélection vidéo */}
      {!videoUri ? (
        <View style={styles.pickZone}>
          <Text style={styles.pickIcon}>🎬</Text>
          <Text style={styles.pickText}>Sélectionne ou filme une vidéo</Text>
          <View style={styles.pickBtns}>
            <TouchableOpacity style={styles.pickBtn} onPress={pickFromGallery}>
              <Text style={styles.pickBtnText}>📁 Galerie</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickBtn} onPress={openCamera}>
              <Text style={styles.pickBtnText}>📷 Caméra</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.previewZone}>
          <Text style={styles.previewLabel}>✅ Vidéo sélectionnée</Text>
          {selectedEffect.id !== 'none' && (
            <Text style={styles.effectLabel}>Effet : {selectedEffect.label}</Text>
          )}
          <Text style={styles.previewUri} numberOfLines={1}>{videoUri}</Text>
          <TouchableOpacity onPress={() => { setVideoUri(null); setSelectedEffect(CAMERA_EFFECTS[0]); }}>
            <Text style={styles.changeBtn}>Changer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Caption */}
      <TextInput
        style={styles.captionInput}
        placeholder="Décris ta vidéo..."
        placeholderTextColor="#666"
        value={caption}
        onChangeText={setCaption}
        multiline
        maxLength={200}
      />
      <Text style={styles.charCount}>{caption.length}/200</Text>

      {/* Sélecteur de catégorie */}
      <Text style={styles.sectionLabel}>Catégorie</Text>
      <TouchableOpacity
        style={styles.categorySelector}
        onPress={() => setShowCategories(true)}>
        <Text style={styles.categorySelectorText}>{category}</Text>
        <Text style={styles.categorySelectorArrow}>▾</Text>
      </TouchableOpacity>

      {/* Progression upload */}
      {uploading && progress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress.percent}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress.percent}% uploadé</Text>
        </View>
      )}

      {/* Bouton publier */}
      <TouchableOpacity
        style={[styles.publishBtn, (!videoUri || uploading) && styles.publishBtnDisabled]}
        onPress={handleUpload}
        disabled={!videoUri || uploading}>
        {uploading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.publishBtnText}>Publier</Text>
        )}
      </TouchableOpacity>

      {/* Modal catégories */}
      <Modal visible={showCategories} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Choisir une catégorie</Text>
            <FlatList
              data={CATEGORIES}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.categoryItem, category === item && styles.categoryItemActive]}
                  onPress={() => { setCategory(item); setShowCategories(false); }}>
                  <Text style={[styles.categoryItemText, category === item && styles.categoryItemTextActive]}>
                    {item}
                  </Text>
                  {category === item && <Text style={styles.categoryCheck}>✓</Text>}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowCategories(false)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal caméra avec effets */}
      <Modal visible={showCamera} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Choisir un effet</Text>
            <Text style={styles.modalSubtitle}>
              L'effet sera appliqué automatiquement à ta vidéo
            </Text>

            <View style={styles.effectsGrid}>
              {CAMERA_EFFECTS.map(effect => (
                <TouchableOpacity
                  key={effect.id}
                  style={[
                    styles.effectItem,
                    selectedEffect.id === effect.id && styles.effectItemActive,
                  ]}
                  onPress={() => setSelectedEffect(effect)}>
                  <Text style={styles.effectIcon}>{effect.icon}</Text>
                  <Text style={[
                    styles.effectLabel2,
                    selectedEffect.id === effect.id && styles.effectLabelActive,
                  ]}>
                    {effect.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.publishBtn} onPress={recordWithCamera}>
              <Text style={styles.publishBtnText}>📷 Filmer avec cet effet</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowCamera(false)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { padding: 24, paddingTop: 60 },
  title: { color: '#FFF', fontSize: 22, fontWeight: '700', marginBottom: 28, textAlign: 'center' },
  pickZone: {
    borderWidth: 1, borderColor: '#333', borderStyle: 'dashed',
    borderRadius: 12, padding: 40, alignItems: 'center', marginBottom: 24,
  },
  pickIcon: { fontSize: 48, marginBottom: 12 },
  pickText: { color: '#888', fontSize: 16, marginBottom: 20 },
  pickBtns: { flexDirection: 'row', gap: 16 },
  pickBtn: {
    backgroundColor: '#1A1A1A', borderRadius: 8,
    paddingVertical: 12, paddingHorizontal: 20,
    borderWidth: 1, borderColor: '#333',
  },
  pickBtnText: { color: '#FFF', fontSize: 14 },
  previewZone: {
    backgroundColor: '#1A1A1A', borderRadius: 12,
    padding: 16, marginBottom: 24,
  },
  previewLabel: { color: '#25F4EE', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  effectLabel: { color: '#FE2C55', fontSize: 12, marginBottom: 6 },
  previewUri: { color: '#888', fontSize: 11, marginBottom: 8 },
  changeBtn: { color: '#FE2C55', fontSize: 13 },
  captionInput: {
    backgroundColor: '#1A1A1A', color: '#FFF', borderRadius: 8,
    padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#333',
    minHeight: 100, textAlignVertical: 'top', marginBottom: 4,
  },
  charCount: { color: '#555', fontSize: 12, textAlign: 'right', marginBottom: 20 },
  sectionLabel: { color: '#888', fontSize: 13, marginBottom: 8 },
  categorySelector: {
    backgroundColor: '#1A1A1A', borderRadius: 8, borderWidth: 1, borderColor: '#333',
    paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center', marginBottom: 24,
  },
  categorySelectorText: { color: '#FFF', fontSize: 15 },
  categorySelectorArrow: { color: '#888', fontSize: 16 },
  progressContainer: { marginBottom: 20 },
  progressBar: {
    height: 4, backgroundColor: '#222', borderRadius: 2, overflow: 'hidden', marginBottom: 6,
  },
  progressFill: { height: '100%', backgroundColor: '#FE2C55', borderRadius: 2 },
  progressText: { color: '#888', fontSize: 12, textAlign: 'center' },
  publishBtn: {
    backgroundColor: '#FE2C55', borderRadius: 8,
    paddingVertical: 16, alignItems: 'center', marginBottom: 8,
  },
  publishBtnDisabled: { opacity: 0.4 },
  publishBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#1A1A1A', borderTopLeftRadius: 20,
    borderTopRightRadius: 20, padding: 24, paddingBottom: 40,
  },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  modalSubtitle: { color: '#666', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  categoryItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2A2A2A',
  },
  categoryItemActive: { },
  categoryItemText: { color: '#888', fontSize: 16 },
  categoryItemTextActive: { color: '#FFF', fontWeight: '600' },
  categoryCheck: { color: '#FE2C55', fontSize: 18 },
  cancelText: { color: '#888', textAlign: 'center', marginTop: 16, fontSize: 14 },
  effectsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    justifyContent: 'center', marginBottom: 24,
  },
  effectItem: {
    width: 80, alignItems: 'center', padding: 12,
    backgroundColor: '#2A2A2A', borderRadius: 12,
    borderWidth: 1, borderColor: '#333',
  },
  effectItemActive: { borderColor: '#FE2C55', backgroundColor: '#2A1010' },
  effectIcon: { fontSize: 28, marginBottom: 6 },
  effectLabel2: { color: '#888', fontSize: 12 },
  effectLabelActive: { color: '#FE2C55', fontWeight: '600' },
});

export default UploadScreen;