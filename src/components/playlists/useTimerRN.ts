/**
 * this is the zustand version of timerContext in noxplayer. replace there to this.
 */

import TrackPlayer from 'react-native-track-player';
import BackgroundTimer from 'react-native-background-timer';

import useTimer from './useTimer2';

export default () => {
  const timer = useTimer({
    onTimerPause: () => BackgroundTimer.stopBackgroundTimer(),
    onTimerRestart: () => {
      BackgroundTimer.stopBackgroundTimer();
      setTimeout(() => {
        BackgroundTimer.stopBackgroundTimer();
      }, 500);
    },
    onTimerUp: () => TrackPlayer.pause(),
  });

  const timerStart = () => {
    timer.timerStartStore();
    BackgroundTimer.runBackgroundTimer(timer.runTimer, 1000);
  };

  return {
    ...timer,
    timerStart,
  };
};
