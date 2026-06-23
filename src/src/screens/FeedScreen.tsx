// src/screens/FeedScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, FlatList,
  ActivityIndicator, Text, ViewToken,
} from 'react-native';
import { useFeed } from '../hooks/useFeed';
import VideoItem from '../components/VideoItem';
import { Video } from '../services/videoService';

const FeedScreen = () => {
  const { videos, loading, hasMore, loadVideos } = useFeed();

  // Index de la vidéo actuellement visible
  const [activeIndex, setActiveIndex] = useState(0);

  // Charge les vidéos au démarrage
  useEffect(() => {
    loadVideos(true);
  }, []);

  // Charge plus de vidéos en fin de liste
  const onEndReached = () => {
    if (hasMore && !loading) {
      loadVideos();
    }
  };

  // Détecte quelle vidéo est visible à l'écran
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  });

  // Rendu de chaque vidéo
  const renderItem = ({ item, index }: { item: Video; index: number }) => (
    <VideoItem
      video={item}
      isActive={index === activeIndex} // active = vidéo visible
    />
  );

  if (loading && videos.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FE2C55" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={require('react-native').Dimensions.get('window').height}
        snapToAlignment="start"
        decelerationRate="fast"
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Aucune vidéo disponible</Text>
          </View>
        }
        ListFooterComponent={
          loading ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color="#FE2C55" size="small" />
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { color: '#888', fontSize: 14 },
  footerLoader: { paddingVertical: 16, alignItems: 'center' },
});

export default FeedScreen;