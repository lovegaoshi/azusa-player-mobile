/**
 * this is the zustand version of timerContext in noxplayer. replace there to this.
 */

import { useEffect } from 'react';
import { create } from 'zustand';
import TrackPlayer from 'react-native-track-player';

interface TimerStore {
  minutes: number;
  setMinutes: (val: number) => void;
  seconds: number;
  setSeconds: (val: number) => void;
  originalMMSS: [number, number];
  setOriginalMMSS: (val: [number, number]) => void;
  startTimer: boolean;
  setStartTimer: (val: boolean) => void;
  timerStart: () => void;
  timerEnd: () => void;
  countdown: () => boolean;
}

const timerStore = create<TimerStore>((set, get) => ({
  minutes: 30,
  setMinutes: (val: number) => set({ minutes: val }),
  seconds: 0,
  setSeconds: (val: number) => set({ seconds: val }),
  originalMMSS: [30, 0],
  setOriginalMMSS: (val: [number, number]) => set({ originalMMSS: val }),
  startTimer: false,
  setStartTimer: (val: boolean) => set({ startTimer: val }),
  timerStart: () => {
    set(state => ({
      startTimer: true,
      originalMMSS: [state.minutes, state.seconds],
    }));
  },
  timerEnd: () => {
    set(state => ({
      startTimer: false,
      minutes: state.originalMMSS[0],
      seconds: state.originalMMSS[1],
    }));
  },
  countdown: () => {
    const seconds = get().seconds;
    const minutes = get().minutes;
    if (seconds > 0) set(() => ({ seconds: seconds - 1 }));
    if (seconds <= 0) {
      if (minutes > 0) {
        set({ seconds: 59 });
        set(() => ({ minutes: minutes - 1 }));
        return false;
      }
      return true;
    }
    return false;
  },
}));

export default () => {
  const minutes = timerStore(state => state.minutes);
  const setMinutes = timerStore(state => state.setMinutes);
  const seconds = timerStore(state => state.seconds);
  const setSeconds = timerStore(state => state.setSeconds);
  const startTimer = timerStore(state => state.startTimer);
  const setStartTimer = timerStore(state => state.setStartTimer);
  const timerStart = timerStore(state => state.timerStart);
  const timerEnd = timerStore(state => state.timerEnd);
  const countdown = timerStore(state => state.countdown);

  const timerPause = () => {
    setStartTimer(false);
  };

  const timerRestart = () => {
    timerEnd();
  };

  const onTimerUp = () => TrackPlayer.pause();

  useEffect(() => {
    if (!startTimer) return () => {};
    const timer = setInterval(() => {
      if (countdown()) {
        onTimerUp();
        clearInterval(timer);
        timerRestart();
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  });

  return {
    minutes,
    seconds,
    startTimer,
    setMinutes,
    setSeconds,
    timerRestart,
    timerStart,
    timerPause,
  };
};
