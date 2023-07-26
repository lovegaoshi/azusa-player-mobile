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

import { logger } from '../Logger';
import { songFetch, fetchVideoInfo } from './bilivideo';
import VideoInfo from 'objects/VideoInfo';
import bfetch from '../BiliFetch';

const URL_BILISERIES_INFO =
  'https://api.bilibili.com/x/series/archives?mid={mid}&series_id={sid}&only_normal=true&sort=desc&pn={pn}&ps=30';

const fetchBiliSeriesList = async (
  mid: string,
  sid: string,
  progressEmitter: (val: number) => void = () => undefined,
  favList: string[] = []
) => {
  logger.info('calling fetchBiliSeriesList');
  const res = await bfetch(
    URL_BILISERIES_INFO.replace('{mid}', mid)
      .replace('{sid}', sid)
      .replace('{pn}', '0')
  );
  const json = await res.json();
  const { data } = json;

  const BVidPromises = [];
  for (let i = 0, n = data.archives.length; i < n; i++) {
    if (favList.includes(data.archives[i].bvid)) {
      logger.debug(
        `fetchBiliSeriesList: skipped duplicate bvid ${data.archives[i].bvid} during rss feed update`
      );
      continue;
    }
    BVidPromises.push(
      fetchVideoInfo(data.archives[i].bvid, () => {
        progressEmitter((100 * (i + 1)) / data.archives.length);
      })
    );
  }
  return (await Promise.all(BVidPromises)).filter(item => item) as VideoInfo[];
};

const regexFetch = async ({
  reExtracted,
  progressEmitter = () => undefined,
  favList,
  useBiliTag,
}: regexFetchProps) => {
  return songFetch({
    videoinfos: await fetchBiliSeriesList(
      reExtracted[1]!,
      reExtracted[2]!,
      progressEmitter,
      favList
    ),
    useBiliTag: useBiliTag || false,
    progressEmitter,
  });
};

const resolveURL = () => undefined;

const refreshSong = (song: NoxMedia.Song) => song;

export default {
  regexSearchMatch:
    /space.bilibili\.com\/(\d+)\/channel\/seriesdetail\?sid=(\d+)/,
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
  refreshSong,
};
