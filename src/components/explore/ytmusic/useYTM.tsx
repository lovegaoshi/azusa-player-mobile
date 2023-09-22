import { useState, useEffect } from 'react';
import { get_home, Home } from 'libmuse';

const useYTM = () => {
  const [homedata, setHomedata] = useState<Home | undefined>();

  const refreshHome = async () => {
    setHomedata(await get_home());
  };

  useEffect(() => {
    refreshHome();
  }, []);

  return { content: homedata?.results, moods: homedata?.moods };
};

export default useYTM;
