import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableWithoutFeedback,
  ViewStyle,
  Easing,
  TextStyle,
  StyleProp,
} from 'react-native';
import type { Track } from 'react-native-track-player';
import { Image } from 'expo-image';
import MarqueeText from 'react-native-text-ticker';

import { useNoxSetting } from '@stores/useApp';
import NoxPlayingList from '@stores/playingList';
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
const AlbumArt = ({
  track,
  windowWidth,
  windowHeight,
  onImagePress = () => undefined,
}: Props) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const coverStyle = {
    width: windowWidth ?? '100%',
    height: windowHeight ?? '100%',
  };

  return (
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
};

const TrackInfoTemplate: React.FC<Props> = props => {
  const { track, windowWidth, children, containerStyle } = props;
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

  const textSubStyle = [
    styles.artistText,
    {
      color: playerStyle.colors.onSurfaceVariant,
    },
  ];
  return (
    <View style={[styles.container, containerStyle, { width: windowWidth }]}>
      {children ?? <AlbumArt {...props} />}
      <SongTitle
        style={styles.titleText}
        text={track?.title}
        bouncePadding={BouncePadding10}
      />
      <View style={styles.infoContainer}>
        <View style={styles.favoriteButtonContainer}>
          <FavReloadButton track={track} />
        </View>
        <View style={styles.artistInfoContainer}>
          <Text style={textSubStyle} numberOfLines={1}>
            {track?.artist}
          </Text>
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

interface SongTitleProps {
  style: StyleProp<TextStyle>;
  text?: string;
  bouncePadding?: { left: number; right: number };
}
export const SongTitle = ({
  style,
  text,
  bouncePadding = BouncePadding,
}: SongTitleProps) => {
  const resolveError = useRef(0);
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <MarqueeText
      duration={3000}
      animationType={'bounce'}
      bounceDelay={2000}
      style={[style, { color: playerStyle.colors.onSurface }]}
      easing={Easing.linear}
      onWidthResolveError={() => resolveError.current++}
      bouncePadding={bouncePadding}
    >
      {text}
    </MarqueeText>
  );
};

const BouncePadding = { left: 0, right: 0 };
const BouncePadding10 = { left: 10, right: 10 };

export default TrackInfoTemplate;

export const styles = StyleSheet.create({
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
