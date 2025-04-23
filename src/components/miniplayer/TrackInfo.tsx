import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { useNoxSetting } from '@stores/useApp';
import NoxPlayingList from '@stores/playingList';
import SongMenuButton from '@components/player/TrackInfo/SongMenuButton';
import FavReloadButton from '@components/player/TrackInfo/FavReloadButton';
import { useTrackStore } from '@hooks/useActiveTrack';
import { SongTitle } from '@components/player/TrackInfo/TrackInfoTemplate';
import ArtistText from './ArtistText';

interface Props extends NoxComponent.OpacityProps {
  artworkOpacity: SharedValue<number>;
}

export default ({ opacity, style, artworkOpacity }: Props) => {
  const track = useTrackStore(s => s.track);
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

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedOpacityStyle = useAnimatedStyle(() => ({
    opacity: artworkOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedOpacityStyle]}>
      <Animated.View style={[styles.container, style, animatedStyle]}>
        <SongTitle style={textStyle} text={track?.title} />
        <View style={styles.infoContainer}>
          <View style={styles.favoriteButtonContainer}>
            <FavReloadButton track={track} />
          </View>
          <View style={styles.artistInfoContainer}>
            <ArtistText track={track} style={textSubStyle} />
            <Text style={textSubStyle} numberOfLines={1}>
              {currentPlayingList.title}
            </Text>
            <Text style={textSubStyle} numberOfLines={1}>
              {getTrackLocation()}
            </Text>
          </View>
          <View style={styles.songMenuButtonContainer}>
            <SongMenuButton track={track} />
          </View>
        </View>
      </Animated.View>
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
