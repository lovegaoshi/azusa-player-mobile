import TrackPlayer, {
  usePlaybackState,
  State,
  usePlayWhenReady,
} from 'react-native-track-player';
import { useDebouncedValue } from 'hooks';
import { ActivityIndicator, IconButton, Text } from 'react-native-paper';
import { Dimensions, TouchableWithoutFeedback, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

import { fadePause } from '@utils/RNTPUtils';
import useTPControls from '@hooks/useTPControls';
import { styles } from '../style';
import useActiveTrack from '@hooks/useActiveTrack';
import { MinPlayerHeight } from './Constants';
import { useNoxSetting } from '@stores/useApp';

const IconSize = 30;
const iconContainerStyle = {
  width: IconSize + 28,
  height: IconSize + 28,
};
const DoublePlayerHeight = MinPlayerHeight * 1.2;

const TrackInfo = () => {
  const { track } = useActiveTrack();
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <View style={[styles.centeredFlex, { paddingLeft: MinPlayerHeight }]}>
      <Text style={{ color: playerStyle.onSurface }}>{track?.title}</Text>
      <Text style={{ color: playerStyle.onSurfaceVariant }}>
        {track?.artist}
      </Text>
    </View>
  );
};

interface Props extends NoxComponent.MiniplayerProps {
  expand: () => void;
}
export default ({ miniplayerHeight, expand }: Props) => {
  const { performSkipToNext, performSkipToPrevious } = useTPControls();
  const PlayerHeight = Dimensions.get('window').height - MinPlayerHeight;
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const HalfScreenHeight = PlayerHeight * 0.5;

  const miniControlOpacity = useDerivedValue(() => {
    if (miniplayerHeight.value > HalfScreenHeight) {
      return 0;
    }
    if (miniplayerHeight.value < DoublePlayerHeight) {
      return 1;
    }
    return 1 - (miniplayerHeight.value - DoublePlayerHeight) / HalfScreenHeight;
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: miniControlOpacity.value,
    };
  });

  return (
    <TouchableWithoutFeedback onPress={expand}>
      <Animated.View style={[styles.rowView, styles.flex, animatedStyle]}>
        <TrackInfo />
        <IconButton
          iconColor={playerStyle.colors.primary}
          icon="skip-previous"
          size={IconSize}
          onPress={performSkipToPrevious}
        />
        <PlayPauseButton />
        <IconButton
          iconColor={playerStyle.colors.primary}
          icon="skip-next"
          size={IconSize}
          onPress={() => performSkipToNext()}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const PlayPauseButton = () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
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
    return <ActivityIndicator size={IconSize - 8} style={iconContainerStyle} />;
  }

  if (showPause) {
    return (
      <IconButton
        iconColor={playerStyle.colors.primary}
        icon="pause"
        size={IconSize}
        onPress={fadePause}
      />
    );
  }
  return (
    <IconButton
      iconColor={playerStyle.colors.primary}
      icon="play"
      size={IconSize}
      onPress={TrackPlayer.play}
    />
  );
};
