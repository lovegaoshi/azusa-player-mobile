import { Animated } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import logger from './Logger';

const animatedVolume = new Animated.Value(1);

animatedVolume.addListener(state => TrackPlayer.setVolume(state.value));

interface animatedVolumeChangeProps {
  val: number;
  duration?: number;
  init?: number;
  callback?: () => void;
}

/**
 * to use: duration is the fade interval,
 * when song starts/R128gain is set, set init = 0.
 */
export const animatedVolumeChange = ({
  val,
  duration = 0,
  init = -1,
  callback = () => undefined,
}: animatedVolumeChangeProps) => {
  logger.debug(
    `[FADING] animating volume from ${init} to ${val} in ${duration}`
  );
  val = Math.min(val, 1);
  if (duration === 0) {
    animatedVolume.setValue(val);
    return;
  }
  if (init !== -1) {
    animatedVolume.setValue(init);
  }
  animatedVolume.stopAnimation();
  Animated.timing(animatedVolume, {
    toValue: val,
    useNativeDriver: true,
    duration,
  }).start(() => callback());
};
