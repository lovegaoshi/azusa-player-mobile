import { fetchPlayUrlPromise } from '../utils/mediafetch/resolveURL';
import { customReqHeader, DEFAULT_UA } from '../utils/BiliFetch';
import { logger } from '../utils/Logger';
import NoxCache from '../utils/Cache';
import { useNoxSetting } from '@stores/useApp';
import { cacheResolvedURL } from '@stores/appStore';
import { getR128Gain } from '@utils/db/sqlAPI';
import { setR128Gain as setR128GainSQL } from '@utils/db/sqlStorage';
import { r128gain, setR128Gain } from '@utils/ffmpeg/ffmpeg';
import { Source } from '@enums/MediaFetch';

export const DEFAULT_NULL_URL = 'NULL';
export const NULL_TRACK = { url: DEFAULT_NULL_URL, urlRefreshTimeStamp: 0 };

export const parseSongR128gain = async (
  song: NoxMedia.Song,
  fade = 0,
  init = -1,
) => {
  const { playerSetting } = useNoxSetting.getState();
  const cachedR128gain = await getR128Gain(song.id);
  // HACK: hard code local file logic
  const cachedUrl = song.bvid?.startsWith?.('file://')
    ? song.bvid
    : await NoxCache.noxMediaCache?.loadCacheMedia(song);
  logger.debug(`[r128gain] found saved r128gain as ${cachedR128gain}`);
  if (!playerSetting.r128gain) {
    logger.debug('[r128gain] player setting is off. setting r128gain to 0');
    setR128Gain(0, song, fade, init);
    return { playerSetting, cachedR128gain, cachedUrl };
  }
  if (cachedR128gain) {
    setR128Gain(cachedR128gain, song, fade, init);
  } else if (cachedUrl) {
    logger.debug('[FFMPEG] r128gain null. now parsing FFMPEG r128gain...');
    const gain = await r128gain(cachedUrl);
    setR128GainSQL(song.id, gain);
    setR128Gain(gain, song, fade, init);
  } else {
    logger.debug(
      '[FFMPEG] waiting for r128gain to be parsed. priming to no gain.',
    );
    setR128Gain(0, song, 0, init);
  }
  return { playerSetting, cachedR128gain, cachedUrl };
};

interface ResolveUrl {
  song: NoxMedia.Song;
  iOS?: boolean;
  prefetch?: boolean;
}
export const resolveUrl = async ({
  song,
  iOS = true,
  prefetch = false,
}: ResolveUrl) => {
  const updateMetadata = async () => {
    try {
      const { playerSetting } = useNoxSetting.getState();
      // HACK: local source will always be refetched,
      // as its album art needs to be cached to a file on disk
      return song.source === Source.local || playerSetting.updateLoadedTrack
        ? await fetchPlayUrlPromise({ song })
        : {};
    } catch (e) {
      logger.warn('failed to resolve updated MetaData');
      logger.warn(e);
      return {};
    }
  };
  // TODO: method is called MULTIPLE times. need to investigate and debounce.
  // luckily bilibili doesnt seem to care for now
  logger.debug(`[SongResolveURL] start resolving ${song.name}`);
  const cachedUrl = await NoxCache.noxMediaCache?.loadCacheMedia(song);
  logger.debug(
    `[SongResolveURL] cache ${cachedUrl ? 'found' : 'missed'}, ${song.id}`,
  );

  const cacheWrapper = async (
    song: NoxMedia.Song,
  ): Promise<NoxNetwork.ResolvedNoxMediaURL> => {
    const { playerSetting } = useNoxSetting.getState();
    const url = cachedUrl
      ? {
          ...(await updateMetadata()),
          url: cachedUrl,
        }
      : await fetchPlayUrlPromise({
          song,
          iOS,
          prefetch,
          noBiliR128Gain: playerSetting.noBiliR128Gain,
        });
    logger.debug(
      `[SongResolveURL] ${song.parsedName} is resolved to ${url.url}`,
    );
    if (url.loudness) {
      logger.debug(
        `[SongResolveURL] ${song.parsedName} contains loudness ${url.loudness} and ${url.perceivedLoudness}`,
      );
      setR128GainSQL(song.id, -url.loudness);
    }
    return {
      url: url.url,
      headers: customReqHeader(url.url),
      userAgent: DEFAULT_UA,
      urlRefreshTimeStamp: Date.now(),
      ...(url.cover && { artwork: url.cover }),
      ...(url.duration && { duration: url.duration }),
    };
  };
  return cacheResolvedURL(song, cacheWrapper);
};
