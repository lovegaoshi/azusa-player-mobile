/**
 * this is the zustand version of timerContext in noxplayer. replace there to this.
 */

import React, { useEffect } from 'react';
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
}));

export default () => {
  const minutes = timerStore(state => state.minutes);
  const setMinutes = timerStore(state => state.setMinutes);
  const seconds = timerStore(state => state.seconds);
  const setSeconds = timerStore(state => state.setSeconds);
  const originalMMSS = timerStore(state => state.originalMMSS);
  const setOriginalMMSS = timerStore(state => state.setOriginalMMSS);
  const startTimer = timerStore(state => state.startTimer);
  const setStartTimer = timerStore(state => state.setStartTimer);

  const timerStart = () => {
    setOriginalMMSS([minutes, seconds]);
    setStartTimer(true);
  };

  const timerPause = () => {
    setStartTimer(false);
  };

  const timerRestart = () => {
    setStartTimer(false);
    setMinutes(originalMMSS[0]);
    setSeconds(originalMMSS[1]);
  };

  const onTimerUp = () => TrackPlayer.pause();

  useEffect(() => {
    if (!startTimer) return () => {};
    const timer = setInterval(() => {
      if (seconds > 0) setSeconds(seconds - 1);
      if (seconds === 0) {
        if (minutes > 0) {
          setSeconds(59);
          setMinutes(minutes - 1);
        } else {
          onTimerUp();
          clearInterval(timer);
          timerRestart();
        }
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
