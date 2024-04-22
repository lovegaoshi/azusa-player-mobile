import { logger } from '../Logger';
import SongTS from '@objects/Song';
import bfetch from '@utils/BiliFetch';
import { Source } from '@enums/MediaFetch';
import { biliApiLimiter } from './throttle';

const API =
  'https://api.bilibili.com/x/copyright-music-publicity/toplist/music_list?{list_id}=175&web_location=0.0';

const topToSong = (data: any) =>
  SongTS({
    cid: `null-${data.mv_bvid}`,
    bvid: data.mv_bvid,
    name: data.creation_title,
    nameRaw: data.creation_title,
    singer: data.creation_nickname,
    singerId: data.creation_up,
    cover: data.creation_cover,
    lyric: '',
    page: 1,
    duration: data.creation_title,
    album: data.creation_title,
    source: Source.bilivideo,
  });

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
