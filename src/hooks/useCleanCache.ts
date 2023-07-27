import { useState } from 'react';

import { useNoxSetting } from './useSetting';
import NoxCache from '../utils/Cache';

const useCleanCache = () => {
  const playlists = useNoxSetting(state => state.playlists);
  const playlistIds = useNoxSetting(state => state.playlistIds);

  const getOrphanCache = () =>
    NoxCache.noxMediaCache.getOrphanedCache(
      playlistIds.reduce(
        (acc, curr) => acc.concat(playlists[curr].songList),
        [] as NoxMedia.Song[]
      )
    );

  const [orphanedCache, setOrphanCache] = useState(getOrphanCache());

  const cleanOrphanedCache = () => {
    NoxCache.noxMediaCache.cleanOrphanedCache(orphanedCache);
    setOrphanCache(getOrphanCache());
  };

  return { orphanedCache, cleanOrphanedCache };
};

export default useCleanCache;
