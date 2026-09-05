import { Source } from '@enums/MediaFetch';
import { logger } from '../Logger';
import { fetchBiliView } from './biliGRPCView';
import SongTS from '@objects/Song';
import { ViewReply } from '../../grpc/bilibili/app/view/v1/view_pb';

// for some reason grpc doesnt work in the chrome extension. for now i'll just
// make chrome ext import the old implementation

const bvToSong = (data: ViewReply): NoxMedia.Song[] => {
  const actualData = data.activitySeason ?? data;
  return actualData.pages.map((page, index: number) => {
    const filename =
      actualData.pages.length === 1 ? actualData.arc?.title : page.page!.part;
    return SongTS({
      cid: Number(page.page?.cid),
      bvid: actualData.bvid,
      name: filename!,
      nameRaw: filename,
      singer: actualData.arc?.author?.name ?? 'N/A',
      singerId: Number(actualData.arc?.author?.mid),
      cover: actualData.arc?.pic ?? '',
      lyric: '',
      page: index + 1,
      duration: Number(page.page?.duration),
      album: actualData.arc?.title ?? '',
      source: Source.bilivideo,
    });
  });
};

export const fetchBVIDRaw = async (bvid: string): Promise<NoxMedia.Song[]> => {
  logger.info(`calling fetchBVID of ${bvid}`);
  try {
    return bvToSong(await fetchBiliView({ bvid }));
  } catch (error: any) {
    logger.error(error.message);
    logger.warn(`[bilivideo] Some issue happened when fetching bvid ${bvid}`);
    return [];
  }
};

export const BVIDtoAID = async (bvid: string): Promise<string> => {
  const res = await fetchBiliView({ bvid });
  return String(res.arc?.aid);
};

export const fetchAVIDRaw = async (aid: string): Promise<NoxMedia.Song[]> => {
  logger.info(`calling fetch bili aID of ${aid}`);
  try {
    return bvToSong(await fetchBiliView({ aid: BigInt(aid) }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(error.message);
    logger.warn(`[bilivideo] Some issue happened when fetching aid ${aid}`);
    return [];
  }
};
