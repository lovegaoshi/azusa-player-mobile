import { logger } from '../Logger';
import SongTS from '@objects/Song';
import bfetch from '@utils/BiliFetch';
import { Source, BiliMusicTid } from '@enums/MediaFetch';
import { biliApiLimiter } from './throttle';

// HACK: this API is deprecated - no new data is being pushed est Apr.2025
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

export interface BiliRanking {
  [key: number]: NoxMedia.Song[];
}

export const fetchRanking = async (rid = '1003', results: BiliRanking = {}) => {
  logger.info(`[biliRanking] calling fetch biliRegionRecommendxc  of ${rid}`);
  try {
    const res = await biliApiLimiter.schedule(() =>
      bfetch(API.replace('{rid}', rid)),
    );
    const json = await res.json();
    json.data.list.forEach((v: any) => {
      if (!BiliMusicTid.includes(v.tid)) return;
      if (results[v.tid]) {
        results[v.tid].push(rankingToSong(v));
      } else {
        results[v.tid] = [rankingToSong(v)];
      }
    });
  } catch (error: any) {
    logger.error(error.message);
    logger.warn(`Some issue happened when fetching ${rid}`);
  }
  return results;
};

export default async (rids = [1003]) => {
  const res: BiliRanking = {};
  for (const rid of rids) {
    await fetchRanking(String(rid), res);
  }
  return res;
};
