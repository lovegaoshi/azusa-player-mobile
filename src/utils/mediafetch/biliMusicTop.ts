import { logger } from '../Logger';
import SongTS from '@objects/Song';
import bfetch from '@utils/BiliFetch';
import { Source } from '@enums/MediaFetch';
import { biliApiLimiter } from './throttle';

const LISTAPI =
  'https://api.bilibili.com/x/copyright-music-publicity/toplist/all_period?list_type=1';

const API =
  'https://api.bilibili.com/x/copyright-music-publicity/toplist/music_list?list_id={list_id}&web_location=0.0';

const topToSong = (data: any) =>
  SongTS({
    cid: `null-${data.creation_bvid}`,
    bvid: data.creation_bvid,
    name: data.creation_title,
    nameRaw: data.creation_title,
    singer: data.creation_nickname,
    singerId: data.creation_up,
    cover: data.creation_cover,
    lyric: '',
    page: 1,
    duration: data.creation_duration,
    album: data.creation_title,
    source: Source.bilivideo,
  });

export const fetchCurrentMusicTop = async () => {
  try {
    const res = await bfetch(LISTAPI);
    const json = await res.json();
    const recentYear = Object.keys(json.data.list).reduce(
      (acc, curr) => (acc > curr ? acc : curr),
      '0'
    );
    const recentList = json.data.list[recentYear].reduce(
      (acc: any, curr: any) => (acc.ID > curr.ID ? acc : curr),
      json.data.list[recentYear][0]
    );
    return fetchMusicTop(recentList.ID);
  } catch {
    return [];
  }
};

export const fetchMusicTop = async (
  listid = '175'
): Promise<NoxMedia.Song[]> => {
  logger.info(`[biliMusicTop] calling fetchMusicTop`);
  try {
    const res = await biliApiLimiter.schedule(() =>
      bfetch(API.replace('{list_id}', listid))
    );
    const json = await res.json();
    return json.data.list.map(topToSong);
  } catch (error: any) {
    logger.error(error.message);
    logger.warn(`[biliMusicTop] Some issue happened`);
    return [];
  }
};
