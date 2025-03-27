import { create } from 'zustand';

import { ArtistFetch } from '@utils/artistfetch/biliartist';
import artistFetch from '@utils/artistfetch/fetch';

interface ArtistStore {
  result: ArtistFetch | undefined;
  fetch: (song?: NoxMedia.Song) => boolean;
  loading: boolean;
  song: NoxMedia.Song | undefined;
}

export default create<ArtistStore>((set, get) => ({
  loading: false,
  result: undefined,
  song: undefined,
  fetch: v => {
    const fetched = artistFetch(v);
    if (!fetched) return false;
    set({ loading: true });
    fetched
      .then(r => set({ result: r, song: v }))
      .catch(() => set({ result: undefined }))
      .finally(() => set({ loading: false }));
    return false;
  },
}));
