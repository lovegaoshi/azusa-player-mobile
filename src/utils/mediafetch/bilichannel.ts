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
import { fetchAwaitBiliPaginatedAPI } from './paginatedbili';
import { awaitLimiter } from './throttle';
import { getDm } from '../Bilibili/bilidm';
import { getWebid } from '../Bilibili/biliWebid';
import { biliShazamOnSonglist } from './bilishazam';
import { timestampToSeconds, appendURLSearchParam } from '../Utils';
import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';

const URL_BILICHANNEL_INFO =
  'https://api.bilibili.com/x/space/wbi/arc/search?mid={mid}&pn={pn}&jsonp=jsonp&ps=50';

const fastSearchResolveBVID = (bvobjs: any[]) =>
  bvobjs.map(obj => {
    const name = obj.title.replaceAll(/<[^<>]*em[^<>]*>/g, '');
    return SongTS({
      cid: `null-${obj.bvid}`,
      bvid: obj.bvid,
      name: name,
      nameRaw: name,
      singer: obj.author,
      singerId: obj.mid,
      cover: obj.pic.replace('http://', 'https://'),
      lyric: '',
      page: 1,
      duration: timestampToSeconds(obj.length),
      album: name,
      source: Source.bilivideo,
    });
  });

interface FetchBiliChannelList {
  url: string;
  progressEmitter?: NoxUtils.ProgressEmitter;
  favList?: string[];
  fastSearch?: boolean;
  stopAtPage?: number;
  limit?: boolean;
}
export const fetchBiliChannelList = async ({
  url,
  progressEmitter = () => undefined,
  favList = [],
  fastSearch = false,
  stopAtPage,
  limit = true,
}: FetchBiliChannelList) => {
  logger.info('calling fetchBiliChannelList');
  const mid = /space.bilibili\.com\/(\d+)/.exec(url)![1];
  let searchAPI = URL_BILICHANNEL_INFO.replace('{mid}', mid);
  const urlObj = new URL(url);
  searchAPI = appendURLSearchParam(searchAPI, urlObj.searchParams, 'tid');
  searchAPI = appendURLSearchParam(searchAPI, urlObj.searchParams, 'keyword');
  searchAPI = appendURLSearchParam(searchAPI, urlObj.searchParams, 'order');

  return fetchAwaitBiliPaginatedAPI({
    url: `${searchAPI}${getDm()}${await getWebid(mid)}`,
    getMediaCount: data => data.page.count,
    getPageSize: data => data.page.ps,
    getItems: js => js.data.list.vlist,
    progressEmitter,
    favList,
    limiter: limit ? awaitLimiter : undefined,
    resolveBiliBVID: fastSearch ? fastSearchResolveBVID : undefined,
    stopAtPage,
  });
};

const regexFetch = async ({
  reExtracted,
  progressEmitter = () => undefined,
  favList,
  useBiliTag,
  fastSearch,
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: await biliShazamOnSonglist(
    await fetchBiliChannelList({
      url: reExtracted.input,
      progressEmitter,
      favList,
      fastSearch,
    }),
    false,
    progressEmitter,
    useBiliTag || false,
  ),
});

const resolveURL = () => undefined;

export default {
  regexSearchMatch: /space.bilibili\.com\/(\d+)(\/search)?\/video/,
  // https://space.bilibili.com/1112031857/upload/video
  regexSearchMatch2: /space.bilibili\.com\/(\d+)(\/upload)?\/video/,
  // https://space.bilibili.com/2097484/search?keyword=f
  regexSearchMatch3: /space.bilibili\.com\/(\d+)\/search/,
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
};
