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
import { timestampToSeconds } from '../Utils';
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

export const fetchBiliChannelList = async (
  url: string,
  progressEmitter: NoxUtils.ProgressEmitter = () => undefined,
  favList: string[] = [],
  fastSearch = false,
) => {
  logger.info('calling fetchBiliChannelList');
  const mid = /space.bilibili\.com\/(\d+)(\/search)?\/video/.exec(url)![1];
  let searchAPI = URL_BILICHANNEL_INFO.replace('{mid}', mid);
  const urlObj = new URL(url);
  const URLParams = new URLSearchParams(urlObj.search);
  const tidVal = URLParams.get('tid');
  if (tidVal) {
    searchAPI += `&tid=${tidVal}`;
  }
  const kwVal = URLParams.get('keyword');
  if (kwVal) {
    searchAPI += `&keyword=${kwVal}`;
  }
  return fetchAwaitBiliPaginatedAPI({
    url: `${searchAPI}${getDm()}${await getWebid(mid)}`,
    getMediaCount: data => data.page.count,
    getPageSize: data => data.page.ps,
    getItems: js => js.data.list.vlist,
    progressEmitter,
    favList,
    limiter: awaitLimiter,
    resolveBiliBVID: fastSearch ? fastSearchResolveBVID : undefined,
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
    await fetchBiliChannelList(
      reExtracted.input,
      progressEmitter,
      favList,
      fastSearch,
    ),
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
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
};
