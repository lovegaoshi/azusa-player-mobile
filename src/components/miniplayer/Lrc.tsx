import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import useActiveTrack from '@hooks/useActiveTrack';
import { LyricView } from '../player/Lyric';

interface Props extends NoxComponent.OpacityProps {
  visible: boolean;
  onPress: () => void;
}

export default ({ visible, onPress, opacity }: Props) => {
  const { track } = useActiveTrack();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    zIndex: 1,
  }));

  if (!visible || !track) {
    return;
  }
  return (
    <Animated.View style={animatedStyle}>
      <LyricView
        track={track}
        artist="n/a"
        onPress={onPress}
        height={500 + 100}
      />
    </Animated.View>
  );
};
