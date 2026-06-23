import React, { useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, FlatList,
  ActivityIndicator, Text, ViewToken,
  Dimensions,
} from 'react-native';
import { useFeed } from '../hooks/useFeed';
import VideoItem from '../components/VideoItem';
import { Video } from '../services/videoService';

const { height: SCREEN_H } = Dimensions.get('window');

const FeedScreen = () => {
  const { videos, loading, hasMore, loadVideos } = useFeed();
  const [activeIndex, setActiveIndex] = useState(0);

  // Fix react-hooks/exhaustive-deps : chargement intentionnel au montage uniquement
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadVideos(true); }, []);

  const onEndReached = () => {
    if (hasMore && !loading) loadVideos();
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  });

  const renderItem = ({ item, index }: { item: Video; index: number }) => (
    <VideoItem video={item} isActive={index === activeIndex} />
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
        snapToInterval={SCREEN_H}
        snapToAlignment="start"
        decelerationRate="fast"
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        getItemLayout={(_, index) => ({
          length: SCREEN_H,
          offset: SCREEN_H * index,
          index,
        })}
        removeClippedSubviews
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
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
    flex: 1, backgroundColor: '#000',
    justifyContent: 'center', alignItems: 'center',
  },
  emptyText: { color: '#888', fontSize: 14 },
  footerLoader: { paddingVertical: 16, alignItems: 'center' },
});

export default FeedScreen;
