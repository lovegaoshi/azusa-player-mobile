import { get_home, Home, Mood } from 'libmuse';
import { create } from 'zustand';

interface YTMExplore {
  homedata?: Home;
  moods: Mood[];
  continuation?: Home['continuation'];
  refreshHome: (params?: string) => Promise<Home>;
  loading: boolean;
  initialize: () => Promise<void>;
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
      moods: homedata.moods,
      continuation: homedata.continuation,
      loading: false,
    });
  },
  refreshHome: async (params?: string) => {
    const homedata = await get_home({ params });
    set({ homedata, continuation: homedata.continuation });
    return homedata;
  },
}));

export default useYTMExplore;
