import React, { useCallback, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';

import type { Track } from 'react-native-track-player';
import TrackPlayer from 'react-native-track-player';
import { useNoxSetting } from '../../hooks/useSetting';
import { LyricView } from './Lyric';

export const TrackInfo: React.FC<{
  track?: Track;
}> = ({ track }) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const playlists = useNoxSetting(state => state.playlists);
  const [currentTPQueue, setCurrentTPQueue] = React.useState<Track[]>([]);
  const [isImageVisible, setIsImageVisible] = useState(true);
  const opacity = new Animated.Value(1);

  const songTitle = useCallback(() => {
    return currentPlayingList ? playlists[currentPlayingList]?.title : '';
  }, [currentPlayingList]);

  React.useEffect(() => {
    // TODO: when the sliding window queue is implemented, this would just be
    // another zustand state.
    TrackPlayer.getQueue().then(setCurrentTPQueue);
  }, [currentPlayingList]);

  const onImagePress = () => {
    console.log('TrackInfo: Image Clicked');
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('TrackInfo: Setting imagevisible to', !isImageVisible);
      setIsImageVisible(!isImageVisible);
    });
  };

  return (
    <>
      {playerSetting.hideCoverInMobile ? null : (
        <>
          <TouchableWithoutFeedback onPress={onImagePress}>
            <View
              style={[
                styles.container,
                {
                  opacity: isImageVisible ? 1 : 0,
                  position: isImageVisible ? 'relative' : 'absolute',
                },
              ]}
              pointerEvents={isImageVisible ? 'auto' : 'none'}
            >
              <Animated.Image
                style={[styles.artwork, { opacity }]}
                source={{ uri: `${track?.artwork}` }}
              />
              <Text style={styles.titleText}>{track?.title}</Text>
              <Text style={styles.artistText}>{track?.artist}</Text>
              <Text style={styles.artistText}>{songTitle()}</Text>
              <Text style={styles.artistText}>
                {currentPlayingList &&
                playlists[currentPlayingList] &&
                track?.song
                  ? `#${
                      playlists[currentPlayingList].songList.findIndex(
                        song => song.id === track.song.id
                      ) + 1
                    } - ${
                      currentTPQueue.findIndex(
                        song => song?.song?.id === track.song.id
                      ) + 1
                    }/${currentTPQueue.length}`
                  : ''}
              </Text>
            </View>
          </TouchableWithoutFeedback>
          <View
            style={[
              styles.lyric,
              {
                opacity: isImageVisible ? 0 : 1,
                position: isImageVisible ? 'absolute' : 'relative',
              },
            ]}
            pointerEvents={isImageVisible ? 'none' : 'auto'}
          >
            <LyricView onLyricPress={onImagePress} title={track?.title} />
          </View>
        </>
      )}
      <Text style={[styles.titleText, { color: playerStyle.colors.text }]}>
        {track?.title}
      </Text>
      <Text style={[styles.artistText, { color: playerStyle.colors.text }]}>
        {track?.artist}
      </Text>
      <Text style={[styles.artistText, { color: playerStyle.colors.text }]}>
        {currentPlayingList ? playlists[currentPlayingList]?.title : ''}
      </Text>
      <Text style={[styles.artistText, { color: playerStyle.colors.text }]}>
        {currentPlayingList && playlists[currentPlayingList] && track?.song
          ? `#${
              playlists[currentPlayingList].songList.findIndex(
                song => song.id === track.song.id
              ) + 1
            } - ${
              currentTPQueue.findIndex(
                song => song?.song?.id === track.song.id
              ) + 1
            }/${currentTPQueue.length}`
          : ''}
      </Text>
    </View>
  );
};

const albumArtSize = Math.min(
  Dimensions.get('window').width,
  Dimensions.get('window').height
);
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  artwork: {
    width: albumArtSize,
    height: albumArtSize,
    marginTop: 15,
    opacity: 1,
    backgroundColor: 'grey',
  },
  lyric: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    opacity: 1,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'grey',
    marginTop: 15,
  },
  artistText: {
    fontSize: 16,
    fontWeight: '200',
  },
});
