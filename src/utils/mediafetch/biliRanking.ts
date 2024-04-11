import { logger } from '../Logger';
import SongTS from '@objects/Song';
import bfetch from '@utils/BiliFetch';
import { Source, BiliMusicTid } from '@enums/MediaFetch';
import { biliApiLimiter } from './throttle';

const API = 'https://api.bilibili.com/x/web-interface/ranking/v2?rid={rid}';

const rankingToSong = (data: any) =>
  SongTS({
    cid: data.cid,
    bvid: data.bvid,
    name: data.title,
    nameRaw: data.title,
    singer: data.owner.name,
    singerId: data.owner.mid,
    cover: data.pic,
    lyric: '',
    page: 1,
    duration: data.duration,
    album: data.title,
    source: Source.bilivideo,
  });

export const fetchRanking = async (rid = '3') => {
  logger.info(`[biliRanking] calling fetchRanking of ${rid}`);
  try {
    const res = await biliApiLimiter.schedule(() =>
      bfetch(API.replace('{rid}', rid))
    );
    const json = await res.json();
    const results = {} as { [key: number]: NoxMedia.Song[] };
    json.data.list.forEach((v: any) => {
      if (!BiliMusicTid.includes(v.tid)) return;
      if (results[v.tid]) {
        results[v.tid].push(rankingToSong(v));
      } else {
        results[v.tid] = [rankingToSong(v)];
      }
    });
    return results;
  } catch (error: any) {
    logger.error(error.message);
    logger.warn(`Some issue happened when fetching ${rid}`);
    return {};
  }
};
