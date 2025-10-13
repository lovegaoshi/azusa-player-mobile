import React from 'react';
import { View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useStore } from 'zustand';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNoxSetting } from '@stores/useApp';
import NoxPlayingList from '@stores/playingList';
import SongMenuButton from '@components/player/TrackInfo/SongMenuButton';
import FavReloadButton from '@components/player/TrackInfo/FavReloadButton';
import { useTrackStore } from '@hooks/useActiveTrack';
import {
  SongTitle,
  styles,
} from '@components/player/TrackInfo/TrackInfoTemplate';
import ArtistText from './ArtistText';
import { NativeText as Text } from '@components/commonui/ScaledText';

interface Props extends NoxComponent.OpacityProps {
  artworkOpacity: SharedValue<number>;
}

export default function MiniplayerTrackInfo({
  opacity,
  style,
  artworkOpacity,
}: Props) {
  const track = useTrackStore(s => s.track);
  const insets = useSafeAreaInsets();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const currentPlayingIndex = useStore(
    NoxPlayingList,
    state => state.currentPlayingIndex,
  );

  const getTrackLocation = () => {
    return track?.song
      ? `#${
          currentPlayingList.songList.findIndex(
            song => song.id === track.song.id,
          ) + 1
        } - ${currentPlayingIndex + 1}/${currentPlayingList.songList.length}`
      : '';
  };

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
      <Animated.View
        style={[
          styles.container,
          style,
          animatedStyle,
          { paddingTop: insets.top },
        ]}
      >
        <SongTitle
          style={styles.titleText}
          text={track?.title}
          bouncePadding={BouncePadding}
        />
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
}

const BouncePadding = { left: 10, right: 10 };
