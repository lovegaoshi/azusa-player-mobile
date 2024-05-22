import { logger } from '../Logger';
import SongTS from '@objects/Song';
import bfetch from '@utils/BiliFetch';
import { Source } from '@enums/MediaFetch';
import { biliApiLimiter } from './throttle';

const API =
  'https://api.bilibili.com/x/centralization/interface/music/hot/rank?plat=2';

/*
{
    "music_title": "使一颗心免于哀伤",
    "music_id": "MA499551868821743371",
    "music_corner": "本周热歌榜3",
    "cid": "1537675442",
    "jump_url": "",
    "author": "知更鸟,HOYO-MiX,Chevy",
    "bvid": "BV15x4y1i7m9",
    "album": "【崩坏：星穹铁道】知更鸟 - 使一颗心免于哀伤",
    "aid": "1004375259",
    "id": 43601,
    "cover": "https://i0.hdslb.com/bfs/station_src/music_metadata/4430d1cc233dd8306380fe5f262a8ba3.jpg"
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

export const fetchMusicHot = async (): Promise<NoxMedia.Song[]> => {
  logger.info('[biliRanking] calling fetchMusicHot');
  try {
    const res = await biliApiLimiter.schedule(() => bfetch(API));
    const json = await res.json();
    return json.data.list
      .map((v: any) => rankingToSong(v))
      .filter((v: NoxMedia.Song) => v.bvid.length > 0);
  } catch (error: any) {
    logger.error(error.message);
    logger.warn('Some issue happened when fetchMusicHot');
    return [];
  }
};
