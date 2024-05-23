/**
 * this is the zustand version of timerContext in noxplayer. replace there to this.
 */

import { create } from "zustand";

import logger from "@utils/Logger";

interface TimerStore {
  minutes: number;
  setMinutes: (val: number) => void;
  seconds: number;
  setSeconds: (val: number) => void;
  originalMMSS: [number, number];
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
  startTimer: false,
  setStartTimer: (val: boolean) => set({ startTimer: val }),
  timerStart: () => {
    set((state) => ({
      startTimer: true,
      originalMMSS: [state.minutes, state.seconds],
    }));
  },
  timerEnd: () => {
    set((state) => ({
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

interface Props {
  onTimerPause?: () => void;
  onTimerRestart?: () => void;
  onTimerUp?: () => void;
}

export default ({
  onTimerPause = () => logger.debug("[timer] paused"),
  onTimerRestart = () => logger.debug("[timer] restarted"),
  onTimerUp = () => logger.debug("[timer] up"),
}: Props) => {
  const minutes = timerStore((state) => state.minutes);
  const setMinutes = timerStore((state) => state.setMinutes);
  const seconds = timerStore((state) => state.seconds);
  const setSeconds = timerStore((state) => state.setSeconds);
  const startTimer = timerStore((state) => state.startTimer);
  const setStartTimer = timerStore((state) => state.setStartTimer);
  const timerStartStore = timerStore((state) => state.timerStart);
  const timerEnd = timerStore((state) => state.timerEnd);
  const countdown = timerStore((state) => state.countdown);

  const timerStart = () => {
    timerStartStore();
    // Add countdown functions here, either a setInterval or RN.backgroundTimer.
  };

  const timerPause = () => {
    onTimerPause();
    setStartTimer(false);
  };

  const timerRestart = () => {
    onTimerRestart();
    timerEnd();
  };

  const runTimer = () => {
    if (countdown()) {
      onTimerUp();
      timerRestart();
      return true;
    }
    return false;
  };

  return {
    minutes,
    seconds,
    startTimer,
    setMinutes,
    setSeconds,
    timerRestart,
    timerStart,
    timerPause,
    runTimer,
    timerStartStore,
  };
};
