import { biliApiLimiter } from './throttle';

import { logger } from '../Logger';
import { biliShazamOnSonglist } from './bilishazam';
import { Source } from '@enums/MediaFetch';
import SongTS from '@objects/Song';
import { fetchBiliView } from './biliGRPCView';

const fetchAVIDRaw = async (aid: string): Promise<NoxMedia.Song[]> => {
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

export const fetchAVID = (
  avid: string,
  progressEmitter: () => void = () => undefined,
) =>
  biliApiLimiter.schedule(() => {
    progressEmitter();
    return fetchAVIDRaw(avid);
  });

export const fetchBiliAVIDs = async (
  AVids: string[],
  progressEmitter: NoxUtils.ProgressEmitter = () => undefined,
  useBiliTag = false,
) => {
  const BVidLen = AVids.length;
  const BVidPromises = AVids.map((avid, index) =>
    fetchAVID(avid, () => progressEmitter((100 * (index + 1)) / BVidLen)),
  );
  const songs = (await Promise.all(BVidPromises)).flat();
  return useBiliTag
    ? biliShazamOnSonglist(songs, false, progressEmitter)
    : songs;
};

const regexFetch = async ({
  reExtracted,
  useBiliTag,
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: await fetchBiliAVIDs(
    [reExtracted[1]],
    undefined,
    useBiliTag || false,
  ),
});

const resolveURL = () => undefined;

export default {
  regexSearchMatch: /av(\d+)/,
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
};
