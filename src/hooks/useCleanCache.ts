import { useState } from 'react';

import { useNoxSetting } from '@stores/useApp';
import NoxCache from '../utils/Cache';
import { lsFiles, unlinkFiles } from '@utils/fs';

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

  const cleanOrphanedCache = async () => {
    const RNBlobTempFiles = await lsFiles();
    const cachedKeys = Array.from(NoxCache.noxMediaCache.cache.values());
    const abandonedFiles = RNBlobTempFiles.list
      .map(val => `${RNBlobTempFiles.dirpath}/${val}`)
      .filter(val => !cachedKeys.includes(val));
    unlinkFiles(abandonedFiles).catch();
    NoxCache.noxMediaCache.cleanOrphanedCache(orphanedCache);
    setOrphanCache(getOrphanCache());
  };

  return { orphanedCache, cleanOrphanedCache };
};

export default useCleanCache;
