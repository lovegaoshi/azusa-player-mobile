import { IconButton } from 'react-native-paper';
import {
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

import { fadePause } from '@utils/RNTPUtils';
import useTPControls from '@hooks/useTPControls';
import usePlaybackState from '@hooks/usePlaybackState';
import { styles } from '../style';
import { useTrackStore } from '@hooks/useActiveTrack';
import { MinPlayerHeight } from './Constants';
import { useNoxSetting } from '@stores/useApp';
import { PaperText as Text } from '@components/commonui/ScaledText';
import { TPPlay } from '@stores/RNObserverStore';
import ActivityIndicator from '@components/commonui/ActivityIndicator';

const IconSize = 30;
const DoublePlayerHeight = MinPlayerHeight * 1.2;

const TrackInfo = () => {
  const track = useTrackStore(s => s.track);
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <View style={[styles.centeredFlex, mStyles.infoContainer]}>
      <Text
        testID={'miniplayer-track-title'}
        numberOfLines={2}
        style={{ color: playerStyle.colors.onSurface }}
      >
        {track?.title}
      </Text>
      <Text
        testID={'miniplayer-track-artist'}
        numberOfLines={1}
        style={{ color: playerStyle.colors.onSurfaceVariant }}
      >
        {track?.artist}
      </Text>
    </View>
  );
};

interface Props extends NoxComponent.MiniplayerProps {
  expand: () => void;
}
export default function MiniplayerControls({
  miniplayerHeight,
  expand,
}: Props) {
  const { performSkipToNext, performSkipToPrevious } = useTPControls();
  const PlayerHeight = Dimensions.get('window').height - MinPlayerHeight;
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const HalfScreenHeight = PlayerHeight * 0.5;

  const miniControlOpacity = useDerivedValue(() => {
    if (miniplayerHeight.value > HalfScreenHeight + miniplayerHeight.value) {
      return 0;
    }
    if (miniplayerHeight.value < DoublePlayerHeight) {
      return 1;
    }
    return (
      (HalfScreenHeight + DoublePlayerHeight - miniplayerHeight.value) /
      HalfScreenHeight
    );
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
}

const PlayPauseButton = () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const { showPause, showBuffering } = usePlaybackState();

  if (showBuffering) {
    return (
      <ActivityIndicator size={IconSize - 8} style={mStyles.iconContainer} />
    );
  }
  return (
    <IconButton
      iconColor={playerStyle.colors.primary}
      icon={showPause ? 'pause' : 'play'}
      size={IconSize}
      onPress={showPause ? fadePause : TPPlay}
    />
  );
};

const mStyles = StyleSheet.create({
  iconContainer: {
    width: IconSize + 28,
    height: IconSize + 28,
  },
  infoContainer: { paddingLeft: MinPlayerHeight, height: MinPlayerHeight },
});
