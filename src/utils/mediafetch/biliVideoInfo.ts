import { Source } from '@enums/MediaFetch';
import { logger } from '../Logger';
import { fetchBiliView } from './biliGRPCView';
import SongTS from '@objects/Song';

// for some reason grpc doesnt work in the chrome extension. for now i'll just
// make chrome ext import the old implementation

export const fetchBVIDRaw = async (bvid: string): Promise<NoxMedia.Song[]> => {
  logger.info(`calling fetchBVID of ${bvid}`);
  try {
    const data = await fetchBiliView({ bvid });
    return data.pages.map((page, index: number) => {
      const filename =
        data.pages.length === 1 ? data.arc?.title : page.page!.part;
      return SongTS({
        cid: Number(page.page?.cid),
        bvid,
        name: filename!,
        nameRaw: filename,
        singer: data.arc?.author?.name ?? 'N/A',
        singerId: Number(data.arc?.author?.mid),
        cover: data.arc?.pic ?? '',
        lyric: '',
        page: index + 1,
        duration: Number(page.page?.duration),
        album: data.arc?.title ?? '',
        source: Source.bilivideo,
      });
    });
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
    const data = await fetchBiliView({ aid: BigInt(aid) });
    return data.pages.map((page, index: number) => {
      const filename =
        data.pages.length === 1 ? data.arc?.title : page.page!.part;
      return SongTS({
        cid: Number(page.page?.cid),
        bvid: data.bvid,
        name: filename!,
        nameRaw: filename,
        singer: data.arc?.author?.name ?? 'N/A',
        singerId: Number(data.arc?.author?.mid),
        cover: data.arc?.pic ?? '',
        lyric: '',
        page: index + 1,
        duration: Number(page.page?.duration),
        album: data.arc?.title ?? '',
        source: Source.bilivideo,
      });
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(error.message);
    logger.warn(`[bilivideo] Some issue happened when fetching aid ${aid}`);
    return [];
  }
};
