import { regexFetchProps } from './generic';
import { biliApiLimiter } from './throttle';

import { logger } from '../Logger';
import bfetch from '@utils/BiliFetch';
import { biliShazamOnSonglist } from './bilishazam';
import SongTS from '@objects/Song';

const URL_VIDEO_INFO =
  'https://api.bilibili.com/x/web-interface/view?aid={aid}';

const fetchAVIDRaw = async (aid: string): Promise<NoxMedia.Song[]> => {
  logger.info(
    `calling fetchAVID of ${aid} of ${URL_VIDEO_INFO.replace('{aid}', aid)}`
  );
  try {
    const res = await bfetch(URL_VIDEO_INFO.replace('{aid}', aid));
    const json = await res.json();
    const { data } = json;
    return data.pages.map((page: any, index: number) => {
      const filename = data.pages.length === 1 ? data.title : page.part;
      return SongTS({
        cid: page.cid,
        bvid: data.bvid,
        name: filename,
        nameRaw: filename,
        singer: data.owner.name,
        singerId: data.owner.mid,
        cover: data.pic,
        lyric: '',
        page: index + 1,
        duration: page.duration,
        album: data.title,
        source: NoxEnumMediaFetch.Source.Bilivideo,
      });
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(error.message);
    logger.warn(`Some issue happened when fetching ${aid}`);
    return [];
  }
};

export const fetchAVID = async (
  avid: string,
  progressEmitter: () => void = () => undefined
) =>
  await biliApiLimiter.schedule(() => {
    progressEmitter();
    return fetchAVIDRaw(avid);
  });

export const fetchBiliAVIDs = async (
  AVids: string[],
  progressEmitter: (val: number) => void = () => undefined,
  useBiliTag = false
) => {
  const BVidLen = AVids.length;
  const BVidPromises = AVids.map((avid, index) =>
    fetchAVID(avid, () => progressEmitter((100 * (index + 1)) / BVidLen))
  );
  const songs = (await Promise.all(BVidPromises)).flat();
  if (useBiliTag) {
    return biliShazamOnSonglist(songs, false, progressEmitter);
  }
  return songs;
};

const regexFetch = async ({
  reExtracted,
  useBiliTag,
}: regexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: await fetchBiliAVIDs(
    [reExtracted[1]!],
    undefined,
    useBiliTag || false
  ),
});

const resolveURL = () => undefined;

export default {
  regexSearchMatch: /av(\d+)/,
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
};
