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
import { regexFetchProps } from './generic';
import { songFetch } from './bilivideo';
import { fetchAwaitBiliPaginatedAPI } from './paginatedbili';
import { awaitLimiter } from './throttle';
import { getDm } from '../Bilibili/bilidm';

const URL_BILICHANNEL_INFO =
  'https://api.bilibili.com/x/space/wbi/arc/search?mid={mid}&pn={pn}&jsonp=jsonp&ps=50';

export const fetchBiliChannelList = async (
  url: string,
  progressEmitter: (val: number) => void = () => undefined,
  favList: string[] = []
) => {
  logger.info('calling fetchBiliChannelList');
  const mid = /.*space.bilibili\.com\/(\d+)\/video.*/.exec(url)![1];
  let searchAPI = URL_BILICHANNEL_INFO.replace('{mid}', mid!);
  const tidVal = /tid=(\d+)/.exec(url);
  if (tidVal) {
    // TODO: do this properly with another URLSearchParams instance
    searchAPI += `&tid=${String(tidVal[1])}`;
  }
  return fetchAwaitBiliPaginatedAPI({
    url: searchAPI + getDm(),
    getMediaCount: data => data.page.count,
    getPageSize: data => data.page.ps,
    getItems: js => js.data.list.vlist,
    progressEmitter,
    favList,
    limiter: awaitLimiter,
  });
};

const regexFetch = async ({
  reExtracted,
  progressEmitter = () => undefined,
  favList,
  useBiliTag,
}: regexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: await songFetch({
    videoinfos: await fetchBiliChannelList(
      reExtracted.input,
      progressEmitter,
      favList
    ),
    useBiliTag: useBiliTag || false,
    progressEmitter,
  }),
});

const resolveURL = () => undefined;

const refreshSong = (song: NoxMedia.Song) => song;

export default {
  regexSearchMatch: /space.bilibili\.com\/(\d+)\/video/,
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
  refreshSong,
};
