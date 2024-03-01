/* eslint-disable @typescript-eslint/no-explicit-any */
import { Platform } from 'react-native';
import LRUCache from 'lru-cache';
import RNFetchBlob from 'react-native-blob-util';
import TrackPlayer from 'react-native-track-player';

import { r128gain, setR128Gain, ffmpegToMP3 } from './ffmpeg/ffmpeg';
import { addDownloadProgress } from '@stores/appStore';
import { addR128Gain, getR128Gain } from '@utils/ffmpeg/r128Store';
import playerSettingStore from '@stores/playerSettingStore';
import { getCachedMediaMapping, saveCachedMediaMapping } from './ChromeStorage';
import { logger } from './Logger';
import { customReqHeader } from './BiliFetch';
import { SOURCE } from '@enums/MediaFetch';

const { getState } = playerSettingStore;

interface optionsProps {
  max?: number;
  [key: string]: any;
}

interface NoxCaches {
  noxMediaCache: NoxMediaCache;
}

export const noxCacheKey = (song: NoxMedia.Song) => `${song.bvid}|${song.id}`;

// TODO: use this! Don't let functioanl programming get over you!
class NoxMediaCache {
  cache: LRUCache<string, string>;

  constructor(
    options: optionsProps,
    savedCache?: [string, LRUCache.Entry<string>][]
  ) {
    this.cache = new LRUCache<string, string>({
      max: options.max || 1,
      dispose: async value => {
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
    const parseR128Gain = async () => {
      if (getState().playerSetting.r128gain) {
        logger.debug('[FFMPEG] now starting FFMPEG r128gain...');
        const previousGain = getR128Gain(song);
        if (previousGain === null) {
          const gain = await r128gain(res.path());
          addR128Gain(song, gain);
          setR128Gain(gain, song);
        } else {
          setR128Gain(previousGain, song);
        }
      }
    };
    // HACK: local files also need r128gain
    if (resolvedURL.url.startsWith('file://')) parseR128Gain();
    if (
      this.cache.max < 2 ||
      !resolvedURL.url.startsWith('http') ||
      song.isLive
    )
      return;
    logger.debug(`[Cache] fetching ${song.name} to cache...`);
    if (!extension) {
      const regexMatch = /.+\/{2}.+\/{1}.+(\.\w+)\?*.*/.exec(resolvedURL.url);
      extension = regexMatch ? regexMatch[1] : 'm4a';
    }
    // https://github.com/joltup/rn-fetch-blob#download-to-storage-directly
    const res = await RNFetchBlob.config({
      fileCache: true,
      appendExt: extension,
    })
      .fetch('GET', resolvedURL.url, resolvedURL.headers)
      .progress((received, total) => {
        const progress = Math.floor((Number(received) * 100) / Number(total));
        addDownloadProgress(song, progress);
        logger.debug(`${song.parsedName} caching progress: ${progress}%`);
      });
    this.cache.set(noxCacheKey(song), res.path());
    addDownloadProgress(song, 100);
    await parseR128Gain();
    if (Platform.OS === 'ios') {
      const mp3Path = await ffmpegToMP3(res.path());
      this.cache.set(noxCacheKey(song), mp3Path);
      const playbackState = await TrackPlayer.getPlaybackState();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (playbackState.error?.code === 'ios_failed_to_load_resource') {
        logger.warn(
          `iOS m4s playback error of ${song.parsedName}. loading cached mp3...`
        );
        const currentTrack = await TrackPlayer.getActiveTrack();
        await TrackPlayer.load({ ...currentTrack, url: mp3Path });
        TrackPlayer.play();
      }
    }
    this.dumpCache();
  };

  loadCacheObject = async (identifier: string, prefix = 'file://') => {
    const cachedPath = this.cache.get(identifier);
    if (!cachedPath || !(await RNFetchBlob.fs.exists(cachedPath)))
      return undefined;
    // no RNFetchBlob.fs.readStream?
    return `${prefix}${cachedPath}`;
  };

  loadCacheMedia = (song: NoxMedia.Song, prefix = 'file://') => {
    // HACK: return song.source if song is local.
    if (song.source === SOURCE.local) {
      // return song.bvid;
    }
    return this.loadCacheObject(noxCacheKey(song), prefix);
  };

  loadCacheFunction = async (
    identifier: string,
    getURL: () => Promise<string>
  ) => {
    logger.debug(`[NoxCache] looking up ${identifier} from cache...`);
    const cachedPath = await this.loadCacheObject(identifier);
    if (cachedPath !== undefined) return cachedPath;
    const resolvedURL = await getURL();
    if (this.cache.max < 2) return resolvedURL;
    logger.debug(`[NoxCache] fetching ${identifier} to cache...`);
    // https://github.com/joltup/rn-fetch-blob#download-to-storage-directly
    RNFetchBlob.config({
      fileCache: true,
    })
      .fetch('GET', resolvedURL, customReqHeader(resolvedURL))
      .progress((received, total) => {
        const progress = Math.floor((Number(received) * 100) / Number(total));
        logger.debug(`[NoxCache] ${identifier} caching progress: ${progress}%`);
      })
      .then(res => {
        this.cache.set(identifier, res.path());
        this.dumpCache();
      });
    return resolvedURL;
  };

  peekCache = (song: NoxMedia.Song) => {
    if (song.source === SOURCE.local) return true;
    return this.cache.peek(noxCacheKey(song));
  };

  getOrphanedCache = (songList: NoxMedia.Song[]) => {
    const songListKeys = songList.map(song => noxCacheKey(song));
    return Array.from(this.cache.keys()).filter(
      key => !songListKeys.includes(key)
    );
  };

  cleanOrphanedCache = (orphanedList: string[]) => {
    orphanedList.forEach(val => {
      const fspath = this.cache.get(val);
      if (fspath) RNFetchBlob.fs.unlink(fspath);
      this.cache.delete(val);
    });
  };

  clearCache = () => {
    for (const val of this.cache.values()) {
      RNFetchBlob.fs.unlink(val);
    }
    this.cache.clear();
  };
  cacheSize = () => Array.from(this.cache.keys()).length;
}

const cache: NoxCaches = {
  noxMediaCache: new NoxMediaCache({
    max: 1,
    dispose: async value => {
      RNFetchBlob.fs.unlink(value);
    },
    allowStale: false,
  } as LRUCache.Options<string, string>),
};

export const initCache = async (
  options: optionsProps,
  savedCache?: [string, LRUCache.Entry<string>][]
) => {
  try {
    cache.noxMediaCache = new NoxMediaCache(options, savedCache);
  } catch (e) {
    console.error(e);
  }
  cache.noxMediaCache.loadCache(savedCache || (await getCachedMediaMapping()));
  return cache;
};

export const cacheWrapper = (
  identifier: string,
  getURL: () => Promise<string>
  // HACK: investigate why RNV6 doesnt play m4s resolved from biliVideo; until then temporarily disable cacheWrapper
) => getURL(); // cache.noxMediaCache.loadCacheFunction(identifier, getURL);

export default cache;
