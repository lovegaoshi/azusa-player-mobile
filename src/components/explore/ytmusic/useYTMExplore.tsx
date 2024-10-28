import { useState, useEffect } from 'react';
import { get_home, Home, Mood } from 'libmuse';

const useYTMExplore = () => {
  const [homedata, setHomedata] = useState<Home>();
  const [moods, setMoods] = useState<Mood[]>([]);

  const initialize = async () => {
    const homedata = await refreshHome();
    setMoods(homedata.moods);
  };

  const refreshHome = async (params?: string) => {
    const homedata = await get_home({ params });
    setHomedata(homedata);
    console.log(homedata);
    return homedata;
  };

  useEffect(() => {
    initialize();
  }, []);

  return {
    content: homedata?.results,
    moods,
    continuation: homedata?.continuation,
    refreshHome,
  };
};

export default useYTMExplore;
