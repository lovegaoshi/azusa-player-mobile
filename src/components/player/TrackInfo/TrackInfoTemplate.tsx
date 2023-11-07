import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableWithoutFeedback,
  ViewStyle,
  Easing,
} from 'react-native';
import type { Track } from 'react-native-track-player';
import { Image } from 'expo-image';
import MarqueeText from 'react-native-text-ticker';

import { useNoxSetting } from '@hooks/useSetting';
import { getCurrentTPQueue } from '@stores/playingList';
import SongMenuButton from './SongMenuButton';
import FavReloadButton from './FavReloadButton';

interface Props {
  track?: Track;
  windowWidth?: number;
  windowHeight?: number;
  onImagePress?: () => void;
  children?: React.JSX.Element;
  containerStyle?: ViewStyle;
}
const TrackInfoTemplate: React.FC<Props> = ({
  track,
  windowWidth,
  windowHeight,
  onImagePress = () => undefined,
  children,
  containerStyle,
}) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const coverStyle = {
    width: windowWidth || '100%',
    height: windowHeight || '100%',
  };

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

  const AlbumArt = () => (
    <TouchableWithoutFeedback onPress={onImagePress}>
      <Animated.View style={styles.container}>
        <Image
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          style={[styles.artwork, coverStyle]}
          source={
            playerSetting.hideCoverInMobile
              ? 0
              : {
                  uri: `${track?.artwork}`,
                }
          }
          transition={{ effect: 'flip-from-top' }}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );

  const textStyle = [
    styles.titleText,
    {
      color: playerStyle.colors.primary,
    },
  ];
  const textSubStyle = [
    styles.artistText,
    {
      color: playerStyle.colors.secondary,
    },
  ];

  return (
    <View style={[styles.container, containerStyle, { width: windowWidth }]}>
      {children || <AlbumArt />}
      <MarqueeText
        duration={3000}
        animationType={'bounce'}
        bounceDelay={2000}
        style={textStyle}
        easing={Easing.linear}
      >
        {track?.title}
      </MarqueeText>
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
    </View>
  );
};

export default TrackInfoTemplate;

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
    marginTop: 15,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
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
