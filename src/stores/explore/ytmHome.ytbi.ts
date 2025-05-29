import {
  get_home,
  Home,
  Mood,
  ParsedPlaylist,
  ParsedAlbum,
  FlatSong,
  ParsedVideo,
  RelatedArtist,
} from 'libmuse';
import { create } from 'zustand';
import last from 'lodash/last';
import { HomeFeed } from 'youtubei.js/dist/src/parser/ytmusic';
import { ChipCloudChip, MusicCarouselShelf, MusicTwoRowItem } from 'youtubei.js/dist/src/parser/nodes';

import { ytClientWeb } from '@utils/mediafetch/ytbi';
import { fetchYtmPlaylist } from '@utils/mediafetch/ytbPlaylist.muse';
import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';

interface YTMExplore {
  homedata?: HomeFeed;
  moods: ChipCloudChip[];
  refreshHome: (params?: string) => Promise<HomeFeed>;
  loading: boolean;
  initialize: () => Promise<void>;
}

const musicTwoRowItemToSong = (v:MusicTwoRowItem) => {

}

export const MusicCarouselShelfTransform = (v: MusicCarouselShelf) => {
  return v.contents.map(k => )
}

export const useYTMExplore = create<YTMExplore>((set, get) => ({
  moods: [],
  loading: true,
  initialize: async () => {
    const { refreshHome, loading } = get();
    if (!loading) {
      return;
    }
    const homedata = await refreshHome();
    set({
      homedata,
      moods: homedata.header?.chips,
      loading: false,
    });
  },
  refreshHome: async (params?: string) => {
    const yt = await ytClientWeb();
    const homedata = await yt.music.getHomeFeed();
    set({ homedata });
    return homedata;
  },
}));

export default useYTMExplore;
