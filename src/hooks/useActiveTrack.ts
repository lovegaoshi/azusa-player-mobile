import React from 'react';
import { create } from 'zustand';
import TrackPlayer, { Track, useActiveTrack } from 'react-native-track-player';

interface TrackStore {
  track: Track | undefined;
  setTrack: (t: Track | undefined) => void;
  updateTrack: (metadata: Partial<Track> | undefined) => Promise<void>;
}

export const useTrackStore = create<TrackStore>((set, get) => ({
  track: undefined,
  setTrack: track => set({ track }),
  updateTrack: async (metadata = {}) => {
    const cTrack = get().track;
    const index = await TrackPlayer.getActiveTrackIndex();
    if (index === undefined) return;
    await TrackPlayer.updateMetadataForTrack(index, metadata);
    // @ts-ignore-error metadata's url is possibly undefined as its a partial.
    set({ track: { ...cTrack, ...metadata } });
  },
}));

const useTrack = () => {
  const activeTrack = useActiveTrack();
  const track = useTrackStore(s => s.track);
  const setTrack = useTrackStore(s => s.setTrack);

  React.useEffect(() => setTrack(activeTrack), [activeTrack]);

  return { track };
};

export default useTrack;
