import { v4 as uuidv4 } from 'uuid';

import { fetchPlayUrlPromise } from '../utils/mediafetch/resolveURL';
import { extractParenthesis } from '../utils/re';
import { customReqHeader, DEFAULT_UA } from '../utils/BiliFetch';
import { logger } from '../utils/Logger';
import NoxCache from '../utils/Cache';
import playerSettingStore from '@stores/playerSettingStore';
import { addR128Gain, getR128Gain, reExtractSongName } from '@stores/appStore';
import { r128gain, setR128Gain } from '@utils/ffmpeg';

export const DEFAULT_NULL_URL = 'NULL';
export const NULL_TRACK = { url: DEFAULT_NULL_URL, urlRefreshTimeStamp: 0 };
const { getState } = playerSettingStore;

interface SongProps {
  cid: string | number;
  bvid: string;
  name: string;
  nameRaw?: string;
  singer: string;
  singerId: string | number;
  cover: string;
  highresCover?: string;
  lyric?: string;
  lyricOffset?: number;
  page?: number;
  biliShazamedName?: string;
  duration?: number;
  album?: string;
  addedDate?: number;
  source?: string;
  isLive?: boolean;
  liveStatus?: boolean;
}

export default ({
  cid,
  bvid,
  name,
  singer,
  cover,
  singerId,
  lyric,
  lyricOffset,
  page,
  biliShazamedName,
  duration = 0,
  album,
  addedDate,
  source,
  isLive,
  liveStatus,
}: SongProps): NoxMedia.Song => {
  return {
    id: String(cid),
    bvid,
    name,
    singer,
    cover,
    singerId,
    lyric,
    lyricOffset,
    page,
    biliShazamedName,
    nameRaw: name,
    parsedName: reExtractSongName(name, singerId),
    duration,
    album,
    addedDate: addedDate || new Date().getTime(),
    source,
    isLive,
    liveStatus,
  };
};

export const setSongBiliShazamed = (
  song: NoxMedia.Song,
  val: string | null
) => {
  if (!val) return { ...song, biliShazamedName: val } as NoxMedia.Song;
  const biliShazamedName = extractParenthesis(val);
  return {
    ...song,
    biliShazamedName,
    nameRaw: song.name,
    name: biliShazamedName,
    parsedName: biliShazamedName,
  } as NoxMedia.Song;
};

export const removeSongBiliShazamed = (song: NoxMedia.Song) => {
  song.biliShazamedName = undefined;
  song.name = song.nameRaw;
  song.parsedName = reExtractSongName(song.name, song.singerId);
};

export const parseSongR128gain = async (
  song: NoxMedia.Song,
  fade = 0,
  init = -1
) => {
  const { playerSetting } = getState();
  const cachedR128gain = getR128Gain(song);
  const cachedUrl = await NoxCache.noxMediaCache?.loadCacheMedia(song);
  logger.debug(`[r128gain] found saved r128gain as ${cachedR128gain}`);
  if (!playerSetting.r128gain) {
    setR128Gain(0, song, fade, init);
    return { playerSetting, cachedR128gain, cachedUrl };
  }
  if (cachedR128gain) {
    setR128Gain(cachedR128gain, song, fade, init);
  } else if (cachedUrl) {
    logger.debug('[FFMPEG] r128gain null. now parsing FFMPEG r128gain...');
    const gain = await r128gain(cachedUrl);
    addR128Gain(song, gain);
    setR128Gain(gain, song, fade, init);
  } else {
    setR128Gain(0, song, fade, init);
  }
  return { playerSetting, cachedR128gain, cachedUrl };
};

export const resolveUrl = async (song: NoxMedia.Song, iOS = true) => {
  const updateMetadata = async () => {
    try {
      const { playerSetting } = getState();
      return playerSetting.updateLoadedTrack
        ? await fetchPlayUrlPromise(song)
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
    `[SongResolveURL] cache ${cachedUrl ? 'found' : 'missed'}, ${song.id}`
  );
  const url = cachedUrl
    ? {
        ...(await updateMetadata()),
        url: cachedUrl,
      }
    : await fetchPlayUrlPromise(song, iOS);
  logger.debug(`[SongResolveURL] ${song.parsedName} is resolved to ${url.url}`);
  if (url.loudness) {
    logger.debug(
      `[SongResolveURL] ${song.parsedName} contains loudness ${url.loudness} and ${url.perceivedLoudness}`
    );
    addR128Gain(song, -url.loudness);
  }
  return {
    url: url.url,
    headers: customReqHeader(url.url, { referer: 'https://www.bilibili.com/' }),
    userAgent: DEFAULT_UA,
    urlRefreshTimeStamp: new Date().getTime(),
    ...(url.cover && { artwork: url.cover }),
    ...(url.duration && { duration: url.duration }),
  };
};

export const dummySong = (): NoxMedia.Song => {
  return {
    id: uuidv4(),
    bvid: '0',
    name: 'dummySong',
    nameRaw: 'dummySong',
    singer: 'dummyArtist',
    singerId: 0,
    cover: '',
    lyric: '',
    lyricOffset: 0,
    parsedName: 'dummySongParsed',
    biliShazamedName: '',
    page: 0,
    duration: 0,
  };
};

export const dummySongObj = dummySong();
