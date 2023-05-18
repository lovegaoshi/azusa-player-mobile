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
import noxPlayingList from '../../store/playingList';
import { LyricView } from './Lyric';
import { NoxRepeatMode } from './enums/RepeatMode';

export const TrackInfo: React.FC<{
  track?: Track;
}> = ({ track }) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const playmode = useNoxSetting(state => state.playerRepeat);
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const [isImageVisible, setIsImageVisible] = useState(true);
  const opacity = new Animated.Value(1);

  const getTrackLocation = () => {
    const currentTPQueue =
      playmode === NoxRepeatMode.SHUFFLE
        ? currentPlayingList.songListShuffled
        : currentPlayingList.songList;
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
            <LyricView onLyricPress={onImagePress} title={track?.title} />
          </View>
        </>
      )}
      <Text style={[styles.titleText, { color: playerStyle.colors.primary }]}>
        {track?.title}
      </Text>
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
