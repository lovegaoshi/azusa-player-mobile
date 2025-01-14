import {
  get_charts,
  ParsedPlaylist,
  ParsedSong,
  ParsedVideo,
  Ranked,
  RelatedArtist,
} from 'libmuse';
import { create } from 'zustand';

interface YTMChartExplore {
  songs: (Ranked<ParsedSong> | Ranked<ParsedVideo>)[];
  videos: Ranked<ParsedVideo>[];
  genres: ParsedPlaylist[];
  trending: (Ranked<ParsedSong> | Ranked<ParsedVideo>)[];
  artists: Ranked<RelatedArtist>[];

  refreshHome: (params?: string) => Promise<void>;
  loading: boolean;
  initialize: () => Promise<ParsedPlaylist[]>;
}

export default create<YTMChartExplore>((set, get) => ({
  songs: [],
  videos: [],
  genres: [],
  trending: [],
  artists: [],
  loading: true,
  initialize: async () => {
    const { refreshHome, loading } = get();
    if (loading) {
      await refreshHome();
    }
    return get().genres;
  },
  refreshHome: async (country?: string) => {
    const homedata = (await get_charts(country)).results;
    set({
      songs: homedata.songs?.results ?? [],
      videos: homedata.videos?.results ?? [],
      genres: homedata.genres?.results ?? [],
      trending: homedata.trending?.results ?? [],
      artists: homedata.artists?.results ?? [],
      loading: false,
    });
  },
}));
