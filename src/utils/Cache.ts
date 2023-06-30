import LRUCache from 'lru-cache';
import RNFetchBlob from 'rn-fetch-blob';

import {
  loadCachedMediaMapping,
  saveCachedMediaMapping,
} from './ChromeStorage';

interface optionsProps {
  max?: number;
  [key: string]: any;
}

interface NoxCaches {
  noxMediaCache?: NoxMediaCache;
}

const noxCacheKey = (song: NoxMedia.Song) => `${song.bvid}|${song.id}`;

// TODO: use this! Don't let functioanl programming get over you!
class NoxMediaCache {
  cache: LRUCache<string, string>;

  constructor(
    options: optionsProps,
    savedCache?: [string, LRUCache.Entry<string>][]
  ) {
    this.cache = new LRUCache<string, string>({
      max: options.max || 1,
      dispose: async (value, key) => {
        RNFetchBlob.fs.unlink(value);
      },
      allowStale: false,
    });
    if (savedCache) {
      this.cache.load(savedCache);
    }
  }

  loadCache = (cache: [string, LRUCache.Entry<string>][]) =>
    this.cache.load(cache);

  dumpCache = () => {
    saveCachedMediaMapping(this.cache.dump());
  };

  saveCacheMedia = async (
    song: NoxMedia.Song,
    resolvedURL: any,
    extension?: string
  ) => {
    if (this.cache.max < 2 || !resolvedURL.url.startsWith('http')) return;
    console.warn(this.cache);
    if (!extension) {
      const regexMatch = /.+\/{2}.+\/{1}.+(\.\w+)\?*.*/.exec(resolvedURL.url);
      extension = regexMatch ? regexMatch[1] : 'm4a';
    }
    // https://github.com/joltup/rn-fetch-blob#download-to-storage-directly
    RNFetchBlob.config({ fileCache: true, appendExt: extension })
      .fetch('GET', resolvedURL.url, resolvedURL.headers)
      .then(res => {
        this.cache.set(noxCacheKey(song), res.path());
        this.dumpCache();
      });
  };

  loadCacheMedia = async (song: NoxMedia.Song, prefix = 'file://') => {
    const cachedPath = this.cache.get(noxCacheKey(song));
    if (!cachedPath || !(await RNFetchBlob.fs.exists(cachedPath)))
      return undefined;
    // no RNFetchBlob.fs.readStream?
    return `${prefix}${cachedPath}`;
  };

  peekCache = (song: NoxMedia.Song) => {
    return this.cache.peek(noxCacheKey(song));
  };

  clearCache = () => {
    for (const val of this.cache.values()) {
      RNFetchBlob.fs.unlink(val);
    }
    this.cache.clear();
  };
  cacheSize = () => Array.from(this.cache.keys()).length;
}

let cache: NoxCaches = {};

export const initCache = async (
  options: optionsProps,
  savedCache?: [string, LRUCache.Entry<string>][]
) => {
  try {
    cache.noxMediaCache = new NoxMediaCache(options, savedCache);
  } catch (e) {
    cache.noxMediaCache = new NoxMediaCache({
      max: 1,
      dispose: async (value, key) => {
        RNFetchBlob.fs.unlink(value);
      },
      allowStale: false,
    } as LRUCache.Options<string, string>);
  }
  cache.noxMediaCache.loadCache(savedCache || (await loadCachedMediaMapping()));
  return cache;
};

export default cache;
