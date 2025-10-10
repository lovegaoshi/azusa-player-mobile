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

import { logger } from '../Logger';
import { bvFetch } from './bilivideo';
import bfetch from '@utils/BiliFetch';

const URL_BILISERIES_INFO =
  'https://api.bilibili.com/x/series/archives?mid={mid}&series_id={sid}&only_normal=true&sort={sort}&pn={pn}&ps=30';

export const fetchBiliSeriesList = async (
  mid: string,
  sid: string,
  favList: string[] = [],
  reverse = false,
) => {
  logger.info('calling fetchBiliSeriesList');
  const res = await bfetch(
    URL_BILISERIES_INFO.replace('{mid}', mid)
      .replace('{sid}', sid)
      .replace('{pn}', '0')
      .replace('{sort}', reverse ? 'asc' : 'desc'),
  );
  const json = await res.json();
  const { data } = json;

  const BVids: string[] = [];
  data.archives.forEach((v: { bvid: string }) => {
    if (favList.includes(v.bvid)) {
      logger.debug(
        `fetchBiliSeriesList: skipped duplicate bvid ${v.bvid} during rss feed update`,
      );
    } else {
      BVids.push(v.bvid);
    }
  });
  return BVids;
};

const regexFetch = async ({
  reExtracted,
  progressEmitter = () => undefined,
  favList,
  useBiliTag,
}: NoxNetwork.RegexFetchProps) => {
  const searchParams = Object.fromEntries(
    new URL('https://www.' + reExtracted[0]).searchParams,
  );

  return bvFetch({
    bvids: await fetchBiliSeriesList(
      reExtracted[1],
      reExtracted[2],
      favList,
      searchParams.reverse !== undefined,
    ),
    useBiliTag: useBiliTag || false,
    progressEmitter,
    reExtracted: [] as unknown as RegExpExecArray,
  });
};

const resolveURL = () => undefined;

export default {
  regexSearchMatch:
    /space.bilibili\.com\/(\d+)\/channel\/seriesdetail\?sid=(\d+).*/,
  //https://space.bilibili.com/3493283607088082/lists/4107910?type=series
  regexSearchMatch2: /space.bilibili\.com\/(\d+)\/lists\/(\d+)\?type=series.*/,
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
};
