import { useState } from 'react';
import { get_home, Home, Mood } from 'libmuse';

export interface UseYTMExplore {
  content?: Home['results'];
  moods: Mood[];
  continuation?: Home['continuation'];
  refreshHome: (params?: string) => Promise<Home>;
  loading: boolean;
  initialize: () => Promise<void>;
}

const useYTMExplore = () => {
  const [homedata, setHomedata] = useState<Home>();
  const [loading, setLoading] = useState(true);
  const [moods, setMoods] = useState<Mood[]>([]);

  const initialize = async () => {
    if (!loading) {
      return;
    }
    const homedata = await refreshHome();
    setMoods(homedata.moods);
    setLoading(true);
  };

  const refreshHome = async (params?: string) => {
    const homedata = await get_home({ params });
    setHomedata(homedata);
    console.log(homedata.results);
    return homedata;
  };

  return {
    content: homedata?.results,
    moods,
    continuation: homedata?.continuation,
    refreshHome,
    loading,
    initialize,
  };
};

export default useYTMExplore;