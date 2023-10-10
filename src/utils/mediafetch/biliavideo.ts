/**
 * refactor:
 * bilisearch workflow:
 * reExtractSearch matches regex patterns and use the corresponding fetch functions;
 * fetch function takes extracted and calls a dataProcess.js fetch function;
 * dataprocess fetch function fetches VIDEOINFO using data.js fetch function, then parses into SONGS
 * data.js fetch function fetches VIDEOINFO.
 * steps to refactor:
 * each site needs a fetch to parse regex extracted, a videoinfo fetcher and a song fetcher.
 */
import { regexFetchProps } from './generic';
import { biliApiLimiter } from './throttle';

import VideoInfo from '@objects/VideoInfo';
import { logger } from '../Logger';
import bfetch from '../BiliFetch';
import { songFetch } from './bilivideo';

const URL_VIDEO_INFO =
  'https://api.bilibili.com/x/web-interface/view?aid={aid}';

const fetchVideoInfoRaw = async (aid: string) => {
  logger.info(
    `calling fetchVideoInfo of ${aid} of ${URL_VIDEO_INFO.replace(
      '{aid}',
      aid
    )}`
  );
  try {
    const res = await bfetch(URL_VIDEO_INFO.replace('{aid}', aid));
    const json = await res.json();
    const { data } = json;
    const v = new VideoInfo(
      data.title,
      data.desc,
      data.videos,
      data.pic,
      data.owner,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.pages.map((s: any) => {
        return {
          bvid: data.bvid,
          part: s.part,
          cid: s.cid,
          duration: s.duration,
        };
      }),
      data.bvid,
      data.duration
    );
    return v;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(error.message);
    logger.warn(`Some issue happened when fetching ${aid}`);
    // throw error;
  }
};

export const fetchVideoInfo = async (
  bvid: string,
  progressEmitter: () => void = () => undefined
) =>
  await biliApiLimiter.schedule(() => {
    progressEmitter();
    return fetchVideoInfoRaw(bvid);
  });

export const fetchiliAVIDs = async (
  AVids: string[],
  progressEmitter: (val: number) => void = () => undefined
) => {
  const BVidLen = AVids.length;
  const BVidPromises = AVids.map((avid, index) =>
    fetchVideoInfo(avid, () => progressEmitter((100 * (index + 1)) / BVidLen))
  );
  const resolvedBVIDs = await Promise.all(BVidPromises);
  return resolvedBVIDs.filter(val => val) as VideoInfo[];
};

const regexFetch = async ({ reExtracted, useBiliTag }: regexFetchProps) => {
  return songFetch({
    videoinfos: await fetchiliAVIDs([reExtracted[1]!]), // await fetchiliBVID([reExtracted[1]!])
    useBiliTag: useBiliTag || false,
  });
};

const resolveURL = () => undefined;

const refreshSong = (song: NoxMedia.Song) => song;

export default {
  regexSearchMatch: /(av[^/?]+)/,
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
  refreshSong,
};
