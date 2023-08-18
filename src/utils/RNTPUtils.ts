import { Animated } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import logger from './Logger';

const animatedVolume = new Animated.Value(1);

animatedVolume.addListener(state => TrackPlayer.setVolume(state.value));

export const animatedVolumeChange = (val: number, duration = 0) => {
  logger.debug(`animating volume to ${val} in ${duration}`);
  if (duration === 0) {
    animatedVolume.setValue(val);
    return;
  }
  animatedVolume.stopAnimation();
  Animated.timing(animatedVolume, {
    toValue: val,
    useNativeDriver: true,
    duration,
  }).start();
};
