import { logger } from '../Logger';
import SongTS from '@objects/Song';
import bfetch from '@utils/BiliFetch';
import { Source } from '@enums/MediaFetch';
import { biliApiLimiter } from './throttle';

const API =
  'https://api.bilibili.com/x/web-interface/region/feed/rcmd?display_id={pn}&request_cnt=20&from_region={rid}';

const rankingToSong = (data: any) =>
  SongTS({
    cid: data.cid,
    bvid: data.bvid,
    name: data.title,
    nameRaw: data.title,
    singer: data.author.name,
    singerId: data.author.mid,
    cover: data.cover,
    lyric: '',
    page: 1,
    duration: data.duration,
    album: data.title,
    source: Source.bilivideo,
  });

export const fetchRecommend = async (
  rid = '1003',
  results: NoxMedia.Song[] = [],
  pn = 1,
) => {
  logger.info(`[biliRecommend] calling fetch biliRegionRecommend of ${rid}`);
  try {
    const res = await biliApiLimiter.schedule(() =>
      bfetch(API.replace('{rid}', rid).replace('{pn}', String(pn))),
    );
    const json = await res.json();
    json.data.archives.forEach((v: any) => {
      results.findIndex(s => s.bvid === v.bvid) === -1 &&
        results.push(rankingToSong(v));
    });
  } catch (error: any) {
    logger.error(error.message);
    logger.warn(`Some issue happened when fetching ${rid}`);
  }
  return results;
};

export default async (rids = [1003]) => {
  const res: NoxMedia.Song[] = [];
  for (const rid of rids) {
    await fetchRecommend(String(rid), res);
    await fetchRecommend(String(rid), res, 2);
  }
  return res;
};
