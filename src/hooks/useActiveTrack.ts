import { create } from 'zustand';
import TrackPlayer, {
  Track,
  useTrackPlayerEvents,
  Event,
} from 'react-native-track-player';

import { removeUndefined } from '@utils/Utils';

interface TrackStore {
  track: Track | undefined;
  setTrack: (t: Track | undefined) => void;
  updateTrack: (metadata?: Partial<Track>) => Promise<void>;
  updateSong: (metadata?: Partial<NoxMedia.Song>, songID?: string) => void;
}

// this is a global store; the default export (useTrack) is initialized in useSetupPlayer
// so it always updates

export const useTrackStore = create<TrackStore>((set, get) => ({
  track: undefined,
  setTrack: track => set({ track }),
  updateTrack: async (metadata = {}) => {
    const cTrack = get().track;
    const index = await TrackPlayer.getActiveTrackIndex();
    if (index === undefined) return;
    const newMetadata = removeUndefined(metadata);
    await TrackPlayer.updateMetadataForTrack(index, newMetadata);
    // @ts-ignore-error metadata's url is possibly undefined as its a partial.
    set({ track: { ...cTrack, ...newMetadata } });
  },
  updateSong: (metadata = {}, songID = undefined) => {
    const cTrack = get().track;
    if (cTrack === undefined || (songID && cTrack.song?.id !== songID)) return;
    set({ track: { ...cTrack, song: { ...cTrack?.song, ...metadata } } });
  },
}));

const useTrack = () => {
  const setTrack = useTrackStore(s => s.setTrack);

  useTrackPlayerEvents(
    [Event.PlaybackActiveTrackChanged],
    async ({ track }) => {
      setTrack(track ?? undefined);
    },
  );

  return {};
};

export default useTrack;
