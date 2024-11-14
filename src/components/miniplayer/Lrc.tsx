import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Dimensions } from 'react-native';

import useActiveTrack from '@hooks/useActiveTrack';
import { LyricView } from '../player/Lyric';

interface Props extends NoxComponent.OpacityProps {
  visible: boolean;
  onPress: () => void;
}

export default ({ visible, onPress, opacity }: Props) => {
  const { track } = useActiveTrack();
  const dimension = Dimensions.get('window');

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    zIndex: visible ? 1 : -1,
    position: 'absolute',
    bottom: 300,
  }));

  if (!visible || !track) {
    return <></>;
  }
  return (
    <Animated.View style={animatedStyle}>
      <LyricView
        track={track}
        artist="n/a"
        onPress={onPress}
        height={dimension.height / 2}
        style={{}}
      />
    </Animated.View>
  );
};
