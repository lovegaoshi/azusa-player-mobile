import LRUCache from 'lru-cache';
import RNFetchBlob from 'rn-fetch-blob';

import {
  loadCachedMediaMapping,
  saveCachedMediaMapping,
} from './ChromeStorage';

interface optionsProps {
  max: number;
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
      max: options.max,
      dispose: async (value, key) => {
        RNFetchBlob.fs.unlink(value);
      },
      allowStale: false,
    });
    if (savedCache) {
      this.cache.load(savedCache);
    }
  }

  dumpCache = () => {
    saveCachedMediaMapping(this.cache.dump());
  };

  saveCacheMedia = async (
    song: NoxMedia.Song,
    resolvedURL: any,
    extension?: string
  ) => {
    if (this.cache.max < 2 || !resolvedURL.url.startsWith('http')) return;
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
}

let cache: LRUCache<string, string>;

export const initCache = async (
  options: optionsProps,
  savedCache?: [string, LRUCache.Entry<string>][]
) => {
  try {
    cache = new LRUCache<string, string>({
      max: options.max,
      dispose: async (value, key) => {
        RNFetchBlob.fs.unlink(value);
      },
      allowStale: false,
    } as LRUCache.Options<string, string>);
  } catch (e) {
    console.error(e, cache, options);
    cache = new LRUCache<string, string>({
      max: 1,
      dispose: async (value, key) => {
        RNFetchBlob.fs.unlink(value);
      },
      allowStale: false,
    } as LRUCache.Options<string, string>);
  }
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
  if (cache.max < 2 || !resolvedURL.url.startsWith('http')) return;
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

export const loadCacheMedia = async (
  song: NoxMedia.Song,
  prefix = 'file://'
) => {
  const cachedPath = cache.get(noxCacheKey(song));
  if (!cachedPath || !(await RNFetchBlob.fs.exists(cachedPath)))
    return undefined;
  // no RNFetchBlob.fs.readStream?
  return `${prefix}${cachedPath}`;
};

export const peekCache = (song: NoxMedia.Song) => {
  return cache.peek(noxCacheKey(song));
};

export const clearCache = () => {
  for (const val of cache.values()) {
    RNFetchBlob.fs.unlink(val);
  }
  cache.clear();
};
