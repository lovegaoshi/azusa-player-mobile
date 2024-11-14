import React, { useRef } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

import { useNoxSetting } from '@stores/useApp';
import NoxPlayingList from '@stores/playingList';
import SongMenuButton from '@components/player/TrackInfo/SongMenuButton';
import FavReloadButton from '@components/player/TrackInfo/FavReloadButton';
import useActiveTrack from '@hooks/useActiveTrack';
import { SongTitle } from '@components/player/TrackInfo/TrackInfoTemplate';

interface Props {
  opacity: SharedValue<number>;
}
export default ({ opacity }: Props) => {
  const { track } = useActiveTrack();
  const { width } = Dimensions.get('window');
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);

  const getTrackLocation = () => {
    return track?.song
      ? `#${
          currentPlayingList.songList.findIndex(
            song => song.id === track.song.id,
          ) + 1
        } - ${NoxPlayingList.getState().currentPlayingIndex + 1}/${
          currentPlayingList.songList.length
        }`
      : '';
  };

  const textStyle = [
    styles.titleText,
    {
      color: playerStyle.colors.onSurface,
    },
  ];
  const textSubStyle = [
    styles.artistText,
    {
      color: playerStyle.colors.onSurfaceVariant,
    },
  ];

  const infoStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      zIndex: opacity.value > 0 ? 1 : 0,
    };
  });

  return (
    <Animated.View
      style={[styles.container, { width: '100%', top: width + 28 }, infoStyle]}
    >
      <SongTitle style={textStyle} text={track?.title} />
      <View style={styles.infoContainer}>
        <View style={styles.favoriteButtonContainer}>
          <FavReloadButton track={track} />
        </View>
        <View style={styles.artistInfoContainer}>
          <Text style={textSubStyle}>{track?.artist}</Text>
          <Text style={textSubStyle}>{currentPlayingList.title}</Text>
          <Text style={textSubStyle}>{getTrackLocation()}</Text>
        </View>
        <View style={styles.songMenuButtonContainer}>
          <SongMenuButton track={track} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  artwork: {
    opacity: 1,
  },
  lyric: {
    opacity: 1,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'grey',
    marginTop: 10,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
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
    // justifyContent: 'center',
    alignItems: 'center',
    marginTop: -5,
  },
  artistInfoContainer: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songMenuButtonContainer: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    marginTop: -5,
  },
});
