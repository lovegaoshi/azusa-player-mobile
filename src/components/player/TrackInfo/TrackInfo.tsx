import React, { useCallback, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import type { Track } from 'react-native-track-player';
import Image from 'react-native-fast-image';

import { useNoxSetting } from '@hooks/useSetting';
import { getCurrentTPQueue } from '@stores/playingList';
import { LyricView } from '../Lyric';
import SongMenuButton from './SongMenuButton';
import FavReloadButton from './FavReloadButton';

export const TrackInfo: React.FC<{
  track?: Track;
}> = ({ track }) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const [isImageVisible, setIsImageVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;

  const getTrackLocation = () => {
    const currentTPQueue = getCurrentTPQueue();
    return track?.song
      ? `#${currentPlayingList.songList.findIndex(
        song => song.id === track.song.id
      ) + 1
      } - ${currentTPQueue.findIndex(song => song.id === track.song.id) + 1
      }/${currentTPQueue.length}`
      : '';
  };

  const onImagePress = () => {
    console.log('TrackInfo: Image Clicked - ');
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('TrackInfo: Setting imagevisible to Image', !isImageVisible);
      setIsImageVisible(!isImageVisible);
    });
  };

  const onLyricPress = () => {
    console.log('TrackInfo: Lyric Clicked - ');
    setIsImageVisible(true);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('TrackInfo: Setting to Lyric', true);
    });
  };

  return (
    <View style={styles.container}>
      <>
        <TouchableWithoutFeedback onPress={onImagePress}>
          <Animated.View
            style={[
              styles.container,
              {
                opacity,
                position: isImageVisible ? 'relative' : 'absolute',
              },
            ]}
            pointerEvents={isImageVisible ? 'auto' : 'none'}
          >
            <Image
              style={[styles.artwork]}
              source={
                playerSetting.hideCoverInMobile
                  ? 0
                  : {
                    uri: `${track?.artwork}`,
                  }
              }
            />
          </Animated.View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={onImagePress}>
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
            {track && (
              <LyricView onLyricPress={onLyricPress} track={track} artist="n/a" />
            )}
          </View>
        </TouchableWithoutFeedback>
      </>
      <Text style={[styles.titleText, { color: playerStyle.colors.primary }]}>
        {track?.title}
      </Text>
      <View style={styles.infoContainer}>
        <View style={styles.favoriteButtonContainer}>
          <FavReloadButton track={track} />
        </View>
        <View style={styles.artistInfoContainer}>
          <Text
            style={[styles.artistText, { color: playerStyle.colors.secondary }]}
          >
            {track?.artist}
          </Text>
          <Text
            style={[styles.artistText, { color: playerStyle.colors.secondary }]}
          >
            {currentPlayingList.title}
          </Text>
          <Text
            style={[styles.artistText, { color: playerStyle.colors.secondary }]}
          >
            {getTrackLocation()}
          </Text>
        </View>
        <View style={styles.songMenuButtonContainer}>
          <SongMenuButton track={track} />
        </View>
      </View>
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
    paddingHorizontal: 5,
  },
  artistText: {
    fontSize: 16,
    fontWeight: '200',
  },
  infoContainer: {
    flexDirection: 'row',
  },
  favoriteButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistInfoContainer: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songMenuButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
