import { useState } from 'react';

import { useNoxSetting } from './useSetting';
import NoxCache from '../utils/Cache';

const useCleanCache = () => {
  const playlists = useNoxSetting(state => state.playlists);
  const playlistIds = useNoxSetting(state => state.playlistIds);
  const [orphanedCache] = useState(
    NoxCache.noxMediaCache.getOrphanedCache(
      playlistIds.reduce(
        (acc, curr) => acc.concat(playlists[curr].songList),
        [] as NoxMedia.Song[]
      )
    )
  );

  const cleanOrphanedCache = () => {
    NoxCache.noxMediaCache.cleanOrphanedCache(orphanedCache);
  };

  return { orphanedCache, cleanOrphanedCache };
};

export default useCleanCache;
