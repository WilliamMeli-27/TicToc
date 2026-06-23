import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, TextInput, ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useFeed, CATEGORIES } from '../hooks/useFeed';
import { Video } from '../services/videoService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 12;

// Avatar sans image locale
const MiniAvatar = ({ uri, name }: { uri?: string | null; name?: string }) => {
  if (uri) {
    return <Image source={{ uri }} style={styles.authorAvatar} />;
  }
  return (
    <View style={[styles.authorAvatar, styles.authorAvatarPlaceholder]}>
      <Text style={styles.authorAvatarText}>
        {name?.charAt(0).toUpperCase() ?? '?'}
      </Text>
    </View>
  );
};

const ForYouScreen = () => {
  const {
    videos, loading, refreshing, searching,
    hasMore, activeCategory, searchQuery,
    loadVideos, handleSearch, handleCategory, refresh,
  } = useFeed();

  const [inputValue, setInputValue] = useState('');

  useEffect(() => { loadVideos(true); });

  const onSearch = () => handleSearch(inputValue);

  const onEndReached = () => {
    if (hasMore && !loading && !searching) loadVideos();
  };

  const formatCount = (count: number): string => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const renderVideo = ({ item }: { item: Video }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      {/* Thumbnail */}
      {item.thumbnailURL ? (
        <Image source={{ uri: item.thumbnailURL }} style={styles.thumbnail} resizeMode="cover" />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      )}

      <View style={styles.cardInfo}>
        <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text>
        {/* Catégorie */}
        {item.category && item.category !== 'Tout' && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        )}
        <View style={styles.cardFooter}>
          <View style={styles.authorRow}>
            <MiniAvatar uri={item.uploaderAvatar} name={item.uploaderUsername} />
            <Text style={styles.authorName} numberOfLines={1}>
              {item.uploaderUsername}
            </Text>
          </View>
          <View style={styles.likesRow}>
            <Text style={styles.likeIcon}>♥</Text>
            <Text style={styles.likesCount}>{formatCount(item.likesCount)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Découvre de nouveaux sujets"
          placeholderTextColor="#666"
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={onSearch}
          returnKeyType="search"
        />
        {inputValue.length > 0 && (
          <TouchableOpacity onPress={() => { setInputValue(''); handleSearch(''); }}>
            <Text style={styles.clearSearchIcon}>✕</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onSearch} style={styles.searchBtn}>
          <Text style={styles.searchBtnText}>Chercher</Text>
        </TouchableOpacity>
      </View>

      {/* Catégories */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item}
        style={styles.categoriesList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryChip, activeCategory === item && styles.categoryChipActive]}
            onPress={() => handleCategory(item)}>
            <Text style={[styles.categoryText, activeCategory === item && styles.categoryTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Indicateur recherche */}
      {searching && (
        <View style={styles.searchingRow}>
          <ActivityIndicator color="#FE2C55" size="small" />
          <Text style={styles.searchingText}>Recherche en cours...</Text>
        </View>
      )}

      {/* Grille vidéos */}
      <FlatList
        data={videos}
        keyExtractor={item => item.id}
        numColumns={2}
        renderItem={renderVideo}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        onRefresh={refresh}
        refreshing={refreshing}
        contentContainerStyle={styles.grid}
        ListFooterComponent={
          loading ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color="#FE2C55" size="small" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? `Aucun résultat pour "${searchQuery}"`
                  : 'Aucune vidéo disponible'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A1A', marginHorizontal: 12,
    marginTop: 50, marginBottom: 10, borderRadius: 10,
    paddingHorizontal: 10, borderWidth: 1, borderColor: '#333',
  },
  searchIcon: { fontSize: 16, marginRight: 6 },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14, paddingVertical: 10 },
  searchBtn: {
    backgroundColor: '#FE2C55', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  searchBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  categoriesList: { paddingLeft: 12, marginBottom: 10, maxHeight: 40 },
  categoryChip: {
    borderWidth: 1, borderColor: '#444', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
    marginRight: 8, backgroundColor: '#1A1A1A',
  },
  categoryChipActive: { backgroundColor: '#FE2C55', borderColor: '#FE2C55' },
  categoryText: { color: '#888', fontSize: 13 },
  categoryTextActive: { color: '#FFF', fontWeight: '700' },
  searchingRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 8,
  },
  searchingText: { color: '#888', fontSize: 13, marginLeft: 8 },
  grid: { paddingHorizontal: 8, paddingBottom: 20 },
  card: {
    width: CARD_WIDTH, backgroundColor: '#1A1A1A',
    borderRadius: 10, margin: 4, overflow: 'hidden',
  },
  thumbnail: { width: '100%', height: CARD_WIDTH * 1.4, backgroundColor: '#1A1A1A' },
  thumbnailPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  cardInfo: { padding: 8 },
  caption: { color: '#FFF', fontSize: 12, marginBottom: 4, lineHeight: 16 },
  categoryBadge: {
    backgroundColor: '#2A2A2A', borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
    alignSelf: 'flex-start', marginBottom: 6,
  },
  categoryBadgeText: { color: '#FE2C55', fontSize: 10, fontWeight: '600' },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  authorAvatar: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#333', marginRight: 4 },
  authorAvatarPlaceholder: { backgroundColor: '#FE2C55', justifyContent: 'center', alignItems: 'center' },
  authorName: { color: '#888', fontSize: 11, flex: 1 },
  likesRow: { flexDirection: 'row', alignItems: 'center' },
  likeIcon: { color: '#FE2C55', fontSize: 12, marginRight: 3 },
  likesCount: { color: '#888', fontSize: 11 },
  footerLoader: { paddingVertical: 16, alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#888', fontSize: 14, textAlign: 'center' },
  authorAvatarText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
  playIcon: { color: '#444', fontSize: 32 },
  clearSearchIcon: { color: '#888', fontSize: 18, marginRight: 6 },
});

export default ForYouScreen;