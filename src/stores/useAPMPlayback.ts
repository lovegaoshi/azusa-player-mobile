import { StateCreator } from 'zustand';

// playback store that supports ABRepeat and crossfade (APM only features)
export interface APMPlaybackStore {
  crossfadeId: string;
  setCrossfadeId: (val: string) => void;

  currentABRepeat: [number, number, number?, number?];
  setCurrentABRepeat: (val: [number, number, number?, number?]) => void;

  abRepeat: [number, number, number?, number?];
  setABRepeat: (val: [number, number, number?, number?]) => void;
  skipARepeat: boolean;
  setSkipARepeat: (val: boolean) => void;
  bRepeatDuration: number;
  setBRepeatDuration: (val: number) => void;
  crossfadingId: string;
  setCrossfadingId: (val: string) => void;
}

const store: StateCreator<
  APMPlaybackStore,
  [],
  [],
  APMPlaybackStore
> = set => ({
  crossfadeId: '',
  setCrossfadeId: v => set({ crossfadeId: v }),

  currentABRepeat: [0, 1],
  setCurrentABRepeat: val => set({ currentABRepeat: val }),

  abRepeat: [0, 1],
  setABRepeat: val => set({ abRepeat: val }),
  skipARepeat: false,
  setSkipARepeat: val => set({ skipARepeat: val }),
  bRepeatDuration: 9999,
  setBRepeatDuration: val => set({ bRepeatDuration: val }),
  crossfadingId: '',
  setCrossfadingId: val => set({ crossfadingId: val }),
});

export default store;
