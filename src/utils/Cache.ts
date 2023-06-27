import LRUCache from 'lru-cache';
import RNFetchBlob from 'rn-fetch-blob';

import {
  loadCachedMediaMapping,
  saveCachedMediaMapping,
} from './ChromeStorage';

let cache: LRUCache<string, string>;

interface optionsProps {
  max: number;
}

const noxCacheKey = (song: NoxMedia.Song) => `${song.bvid}|${song.id}`;

export const initCache = async (
  options: optionsProps,
  savedCache?: [string, LRUCache.Entry<string>][]
) => {
  cache = new LRUCache<string, string>({
    max: options.max,
    dispose: async (value, key) => {
      RNFetchBlob.fs.unlink(value);
    },
    allowStale: false,
  });
  cache.load(savedCache || (await loadCachedMediaMapping()));
  return cache;
};

export const dumpCache = () => {
  saveCachedMediaMapping(cache.dump());
};

export const saveCacheMedia = async (
  song: NoxMedia.Song,
  resolvedURL: any,
  extension?: string
) => {
  if (cache.max < 1 || !resolvedURL.url.startsWith('http')) return;
  if (!extension) {
    const regexMatch = /.+\/{2}.+\/{1}.+(\.\w+)\?*.*/.exec(resolvedURL.url);
    extension = regexMatch ? regexMatch[1] : 'm4a';
  }
  // https://github.com/joltup/rn-fetch-blob#download-to-storage-directly
  RNFetchBlob.config({ fileCache: true, appendExt: extension })
    .fetch('GET', resolvedURL.url, resolvedURL.headers)
    .then(res => {
      cache.set(noxCacheKey(song), res.path());
      dumpCache();
    });
};

export const loadCacheMedia = async (song: NoxMedia.Song, prefix = 'file://') => {
  const cachedPath = cache.get(noxCacheKey(song));
  if (!cachedPath || !(await RNFetchBlob.fs.exists(cachedPath))) return undefined;
  // no RNFetchBlob.fs.readStream?
  return `${prefix}${cachedPath}`;
};
