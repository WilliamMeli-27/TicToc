// src/screens/VideoPlayerScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, FlatList,
  TouchableOpacity, Text, Dimensions, ViewToken,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ForYouStackParamList } from '../navigation/types';
import VideoItem from '../components/VideoItem';
import { Video } from '../services/videoService';

const { height } = Dimensions.get('window');
type RouteType = RouteProp<ForYouStackParamList, 'VideoPlayer'>;

const VideoPlayerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteType>();
  const { videos, videoId } = route.params;

  const startIndex = videos.findIndex((v: Video) => v.id === videoId);
  const [activeIndex, setActiveIndex] = useState(
    startIndex >= 0 ? startIndex : 0
  );

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

  return (
    <View style={styles.container}>

      {/* Bouton retour */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      {/* Lecteur plein écran */}
      <FlatList
        data={videos}
        keyExtractor={(item: Video) => item.id}
        renderItem={({ item, index }: { item: Video; index: number }) => (
          <VideoItem
            video={item}
            isActive={index === activeIndex}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        initialScrollIndex={startIndex >= 0 ? startIndex : 0}
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  backBtn: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  backIcon: { color: '#FFF', fontSize: 20 },
});

export default VideoPlayerScreen;