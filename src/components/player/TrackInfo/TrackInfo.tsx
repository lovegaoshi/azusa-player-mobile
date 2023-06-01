import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import type { Track } from 'react-native-track-player';

import { useNoxSetting } from '../../../hooks/useSetting';
import { getCurrentTPQueue } from '../../../stores/playingList';
import { LyricView } from '../Lyric';
import SongMenuButton from './SongMenuButton';
import FavoriteButton from './FavoriteButton';

export const TrackInfo: React.FC<{
  track?: Track;
}> = ({ track }) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const [isImageVisible, setIsImageVisible] = useState(true);
  const opacity = new Animated.Value(1);

  const getTrackLocation = () => {
    const currentTPQueue = getCurrentTPQueue();
    return track?.song
      ? `#${
          currentPlayingList.songList.findIndex(
            song => song.id === track.song.id
          ) + 1
        } - ${
          currentTPQueue.findIndex(song => song.id === track.song.id) + 1
        }/${currentTPQueue.length}`
      : '';
  };

  const onImagePress = () => {
    console.log('TrackInfo: Image Clicked - ', track);
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
    <View style={styles.container}>
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
            <LyricView onLyricPress={onImagePress} track={track} />
          </View>
        </>
      )}
      <Text style={[styles.titleText, { color: playerStyle.colors.primary }]}>
        {track?.title}
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <FavoriteButton track={track} />
        </View>
        <View
          style={{
            flex: 4,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={[styles.artistText, { color: playerStyle.colors.secondary }]}
          >
            {track?.artist}
          </Text>
          <Text
            style={[styles.artistText, { color: playerStyle.colors.secondary }]}
          >
            {
              // HACK: this becomes a problem when a playlist is renamed while playing.
              // but its okay i think. its safer to guard against eg. playlist deletion?
              currentPlayingList.title
            }
          </Text>
          <Text
            style={[styles.artistText, { color: playerStyle.colors.secondary }]}
          >
            {getTrackLocation()}
          </Text>
        </View>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
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
  },
  artistText: {
    fontSize: 16,
    fontWeight: '200',
  },
});
