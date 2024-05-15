import { logger } from '../Logger';
import SongTS from '@objects/Song';
import bfetch from '@utils/BiliFetch';
import { Source } from '@enums/MediaFetch';
import { biliApiLimiter } from './throttle';

const API = 'https://api.bilibili.com/x/centralization/interface/new/music';

/*
{
  "id": 1562,
  "music_id": "MA512903599496377528",
  "music_title": "Girls Never Die",
  "music_corner": "",
  "publish_time": "2024-05-08 00:00:00",
  "jump_url": "",
  "priority": 0,
  "rank": 999,
  "wish_listen": false,
  "wish_count": 50968,
  "cover": "https://i0.hdslb.com/bfs/station_src/music_metadata/7a9a8783062ea7c7b87947c4df962753.jpg",
  "author": "tripleS",
  "album": "<ASSEMBLE24>",
  "aid": "1604079196",
  "cid": "1534549285",
  "bvid": "BV1cm421H7Bf"
},
*/

const rankingToSong = (data: any) =>
  SongTS({
    cid: data.cid,
    bvid: data.bvid,
    name: data.music_title,
    nameRaw: data.music_title,
    singer: data.author,
    singerId: data.id,
    cover: data.cover,
    lyric: '',
    page: 1,
    duration: 0,
    album: data.album,
    source: Source.bilivideo,
  });

export const fetchMusicNew = async (): Promise<NoxMedia.Song[]> => {
  logger.info(`[biliRanking] calling fetchMusicNew`);
  try {
    const res = await biliApiLimiter.schedule(() => bfetch(API));
    const json = await res.json();
    return json.data.list
      .map((v: any) => rankingToSong(v))
      .filter((v: NoxMedia.Song) => v.bvid.length > 0);
  } catch (error: any) {
    logger.error(error.message);
    logger.warn(`Some issue happened when fetchMusicNew`);
    return [];
  }
};
