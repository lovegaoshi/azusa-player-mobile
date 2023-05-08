import { fetchPlayUrlPromise } from '../utils/Data';
import { reExtractSongName, extractParenthesis } from '../utils/re';
import SongInterface from './SongInterface';
import { customReqHeader, DEFAULT_UA } from '../utils/BiliFetch';

export const DEFAULT_NULL_URL = 'NULL';
export const NULL_TRACK = { url: DEFAULT_NULL_URL, urlRefreshTimeStamp: 0 };

interface SongProps {
  cid: string | number;
  bvid: string;
  name: string;
  nameRaw: string;
  singer: string;
  singerId: string | number;
  cover: string;
  lyric: string | undefined;
  lyricOffset: number | undefined;
  page: number | undefined;
  biliShazamedName: string | undefined;
  duration: number;
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
  duration,
}: SongProps): SongInterface => {
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
  };
};

export const setSongBiliShazamed = (
  song: SongInterface,
  val: string | null
) => {
  if (!val) return { ...song, biliShazamedName: val } as SongInterface;
  const biliShazamedName = extractParenthesis(val);
  return {
    ...song,
    biliShazamedName,
    nameRaw: song.name,
    name: biliShazamedName,
    parsedName: biliShazamedName,
  } as SongInterface;
};

export const removeSongBiliShazamed = (song: SongInterface) => {
  song.biliShazamedName = undefined;
  song.name = song.nameRaw;
  song.parsedName = reExtractSongName(song.name, song.singerId);
};

export const resolveUrl = async (song: SongInterface) => {
  try {
    const url = await fetchPlayUrlPromise(song.bvid, song.id);
    return {
      url,
      headers: customReqHeader(url, {}),
      userAgent: DEFAULT_UA,
      urlRefreshTimeStamp: new Date().getTime(),
    };
  } catch {
    return NULL_TRACK;
  }
};
