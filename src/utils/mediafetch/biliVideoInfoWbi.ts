import { Source } from '@enums/MediaFetch';
import { wbiQuery } from '@stores/wbi';
import SongTS from '@objects/Song';
import { logger } from '../Logger';

const URL_VIDEO_INFO =
  'https://api.bilibili.com/x/web-interface/wbi/view/detail';

const bvToSongs = (data: any): NoxMedia.Song[] => {
  return data.View.pages.map((page: any, index: number) => {
    const filename = data.View.pages.length === 1 ? data.View.title : page.part;
    return SongTS({
      cid: page.cid,
      bvid: data.View.bvid,
      name: filename,
      nameRaw: filename,
      singer: data.View.owner.name,
      singerId: data.View.owner.mid,
      cover: data.View.pic,
      lyric: '',
      page: index + 1,
      duration: page.duration,
      album: data.title,
      source: Source.bilivideo,
    });
  });
};
export const fetchAVIDRaw = async (aid: string): Promise<NoxMedia.Song[]> => {
  const api = `${URL_VIDEO_INFO}?aid=${aid}`;
  logger.info(`calling fetchAVID of ${aid} of ${api}`);
  try {
    const res = await wbiQuery(api);
    const json = await res.json();
    const { data } = json;
    return bvToSongs(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(error.message);
    logger.warn(`Some issue happened when fetching ${aid}`);
    return [];
  }
};

export const fetchBVIDRaw = async (bvid: string): Promise<NoxMedia.Song[]> => {
  const api = `${URL_VIDEO_INFO}?bvid=${bvid}`;
  logger.info(`calling fetchBVID of ${bvid} of ${api}`);
  try {
    const res = await wbiQuery(api);
    const json = await res.json();
    const { data } = json;
    return bvToSongs(data);
  } catch (error: any) {
    logger.error(error.message);
    logger.warn(`Some issue happened when fetching ${bvid}`);
    return [];
  }
};

export const BVIDtoAID = async (bvid: string): Promise<string> => {
  const res = await wbiQuery(`${URL_VIDEO_INFO}?bvid=${bvid}`);
  const json = await res.json();
  return String(json.data.View.aid);
};
