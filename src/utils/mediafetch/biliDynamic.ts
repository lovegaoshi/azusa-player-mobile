import { logger } from '../Logger';
import SongTS from '@objects/Song';
import bfetch from '@utils/BiliFetch';
import { BiliMusicTid, Source } from '@enums/MediaFetch';
import { biliApiLimiter } from './throttle';

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

export const fetchDynamic = async (rid = '3', page = 1) => {
  logger.info(`[biliDynamic] calling fetchDynamic of ${rid}`);
  try {
    const res = await biliApiLimiter.schedule(() =>
      bfetch(API.replace('{rid}', rid).replace('{pn}', page.toString())),
    );
    const json = await res.json();
    const results = {} as { [key: number]: NoxMedia.Song[] };
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
