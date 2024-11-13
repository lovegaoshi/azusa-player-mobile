import {
  usePlaybackState,
  State,
  usePlayWhenReady,
} from 'react-native-track-player';
import { useDebouncedValue } from 'hooks';
import { ActivityIndicator, IconButton, Text } from 'react-native-paper';
import { View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

import { fadePause, fadePlay } from '@utils/RNTPUtils';
import useTPControls from '@hooks/useTPControls';
import { styles } from '../style';
import { ScreenHeight } from '@utils/RNUtils';
import useActiveTrack from '@hooks/useActiveTrack';
import { MinPlayerHeight } from './Constants';
import { useNoxSetting } from '@stores/useApp';

const IconSize = 30;
const iconContainerStyle = { width: IconSize + 16, height: IconSize + 16 };
const HalfScreenHeight = ScreenHeight * 0.5;
const DoublePlayerHeight = MinPlayerHeight * 1.2;

const TrackInfo = () => {
  const { track } = useActiveTrack();
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <View style={styles.centeredFlex}>
      <Text style={{ color: playerStyle.onSurface }}>{track?.title}</Text>
      <Text style={{ color: playerStyle.onSurfaceVariant }}>
        {track?.artist}
      </Text>
    </View>
  );
};

const PlayerControls = ({ miniplayerHeight }: Props) => {
  const { performSkipToNext, performSkipToPrevious } = useTPControls();
  const miniControlOpacity = useDerivedValue(() => {
    if (miniplayerHeight.value > HalfScreenHeight) {
      return 0;
    }
    if (miniplayerHeight.value < DoublePlayerHeight) {
      return 1;
    }
    return 1 - (miniplayerHeight.value - DoublePlayerHeight) / HalfScreenHeight;
  });

  const controlStyle = useAnimatedStyle(() => {
    return {
      opacity: miniControlOpacity.value,
    };
  });

  return (
    <Animated.View style={[styles.rowView, styles.flex, controlStyle]}>
      <TrackInfo />
      <IconButton
        icon="skip-previous"
        size={IconSize}
        onPress={performSkipToPrevious}
      />
      <PlayPauseButton />
      <IconButton
        icon="skip-next"
        size={IconSize}
        onPress={() => performSkipToNext()}
      />
    </Animated.View>
  );
};

const PlayPauseButton = () => {
  const playback = usePlaybackState();
  const playWhenReady = usePlayWhenReady();
  const isLoading = useDebouncedValue(
    playback.state === State.Loading, // || state === State.Buffering
    250,
  );
  const isErrored = playback.state === State.Error;
  const isEnded = playback.state === State.Ended;
  const showPause = playWhenReady && !(isErrored || isEnded);
  const showBuffering = isErrored || (playWhenReady && isLoading);

  if (showBuffering) {
    return <ActivityIndicator size={IconSize - 5} style={iconContainerStyle} />;
  }

  if (showPause) {
    return <IconButton icon="pause" size={IconSize} onPress={fadePause} />;
  }
  return <IconButton icon="play" size={IconSize} onPress={fadePlay} />;
};

interface Props {
  miniplayerHeight: SharedValue<number>;
}

export default ({ miniplayerHeight }: Props) => {
  return (
    <View style={styles.rowView}>
      <PlayerControls miniplayerHeight={miniplayerHeight} />
    </View>
  );
};
