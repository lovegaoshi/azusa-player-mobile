import { useActiveTrack } from 'react-native-track-player';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { Progress } from './ProgressBars/Progress';
import { PlayerControls } from './PlayerControls';
import { styles } from '@components/style';

export default function PlayerProgressControls({
  opacity,
  style,
}: NoxComponent.OpacityProps) {
  const track = useActiveTrack();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });
  return (
    <Animated.View style={[styles.actionRowContainer, animatedStyle, style]}>
      <Progress live={track?.isLiveStream} />
      <PlayerControls />
    </Animated.View>
  );
}
