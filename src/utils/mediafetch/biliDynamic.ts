import { logger } from '../Logger';
import SongTS from '@objects/Song';
import bfetch from '@utils/BiliFetch';
import { BiliMusicTid, Source } from '@enums/MediaFetch';
import { biliApiLimiter } from './throttle';
import { BiliRanking } from './biliRanking';

const API =
  'https://api.bilibili.com/x/web-interface/dynamic/region?rid={rid}&ps=50&pn={pn}';

const dynamicToSong = (data: any) =>
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

export const fetchDynamic = async (
  rid = '3',
  page = 1,
  results: BiliRanking = {},
) => {
  logger.info(`[biliDynamic] calling fetchDynamic of ${rid}`);
  try {
    const res = await biliApiLimiter.schedule(() =>
      bfetch(API.replace('{rid}', rid).replace('{pn}', page.toString())),
    );
    const json = await res.json();
    json.data.archives.forEach((v: any) => {
      if (!BiliMusicTid.includes(v.tid)) return;
      if (results[v.tid]) {
        results[v.tid].push(dynamicToSong(v));
      } else {
        results[v.tid] = [dynamicToSong(v)];
      }
    });
    return results;
  } catch (error: any) {
    logger.error(error.message);
    logger.warn(`Some issue happened when fetching ${rid}`);
    return {};
  }
};

interface Dynamic {
  rids?: number[];
  page?: number;
}

export default async ({ rids = [3, 199], page = 1 }: Dynamic) => {
  const res: BiliRanking = {};
  for (const rid of rids) {
    await fetchDynamic(String(rid), page, res);
  }
  return res;
};
