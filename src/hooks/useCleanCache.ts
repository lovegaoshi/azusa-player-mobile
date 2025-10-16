import { useEffect, useState } from 'react';

import { useNoxSetting } from '@stores/useApp';
import NoxCache from '../utils/Cache';
import { lsFiles, unlinkFiles } from '@utils/fs';

const useCleanCache = () => {
  const getPlaylist = useNoxSetting(state => state.getPlaylist);
  const playlistIds = useNoxSetting(state => state.playlistIds);

  const getOrphanCache = async () => {
    const playlists = await Promise.all(playlistIds.map(v => getPlaylist(v)));
    return NoxCache.noxMediaCache.getOrphanedCache(
      playlists.reduce(
        (acc, curr) => acc.concat(curr.songList),
        [] as NoxMedia.Song[],
      ),
    );
  };

  const [orphanedCache, setOrphanCache] = useState<string[]>([]);

  const cleanOrphanedCache = async () => {
    const RNBlobTempFiles = await lsFiles();
    const cachedKeys = new Set(NoxCache.noxMediaCache.cache.values());
    const abandonedFiles = RNBlobTempFiles.list
      .map(val => `${RNBlobTempFiles.dirpath}/${val}`)
      .filter(val => !cachedKeys.has(val));
    unlinkFiles(abandonedFiles).catch();
    NoxCache.noxMediaCache.cleanOrphanedCache(orphanedCache);
    getOrphanCache().then(setOrphanCache);
  };

  useEffect(() => {
    getOrphanCache().then(setOrphanCache);
  }, []);

  return { orphanedCache, cleanOrphanedCache };
};

export default useCleanCache;
