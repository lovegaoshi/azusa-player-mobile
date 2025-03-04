import { create } from 'zustand';

import fetchDynamic from '@utils/mediafetch/biliDynamic';
import { fetchRanking } from '@utils/mediafetch/biliRanking';
import { fetchCurrentMusicTop } from '@utils/mediafetch/biliMusicTop';
import { fetchMusicHot } from '@utils/mediafetch/biliMusicHot';
import { fetchMusicNew } from '@utils/mediafetch/biliMusicNew';
import { BiliCatSongs } from '@components/explore/SongTab';

interface BiliExplore {
  biliDynamic: BiliCatSongs;
  biliRanking: BiliCatSongs;
  biliMusicTop: NoxMedia.Song[];
  biliMusicHot: NoxMedia.Song[];
  biliMusicNew: NoxMedia.Song[];
  refreshing: boolean;
  loading: boolean;
  onRefresh: () => void;
  init: () => void;
}

export default create<BiliExplore>((set, get) => ({
  biliDynamic: {},
  biliRanking: {},
  biliMusicTop: [],
  biliMusicHot: [],
  biliMusicNew: [],
  refreshing: false,
  loading: true,
  onRefresh: async () => {
    set({ refreshing: true });
    set({ biliDynamic: await fetchDynamic({}), refreshing: false });
  },
  init: async () => {
    if (!get().loading) {
      return;
    }
    set({
      loading: false,
      biliRanking: await fetchRanking(),
      biliDynamic: await fetchDynamic({}),
      biliMusicTop: await fetchCurrentMusicTop(),
      biliMusicHot: await fetchMusicHot(),
      biliMusicNew: await fetchMusicNew(),
    });
  },
}));
