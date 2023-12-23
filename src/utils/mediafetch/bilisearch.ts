/* eslint-disable prefer-destructuring */
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
import { songFetch } from './bilivideo';
import { fetchBiliPaginatedAPI } from './paginatedbili';
import VideoInfo from '@objects/VideoInfo';
import { timestampToSeconds } from '../Utils';
import bfetch from '../BiliFetch';
import { getBiliCookie } from '../Bilibili/biliCookies';

const URL_BILI_SEARCH =
  'https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword={keyword}&page={pn}&tids=3';

let cookie: string;

const getCookie = async (cookiedSearch = false) => {
  // TODO: add refresh here?
  if (!cookie) {
    const res = await bfetch('https://api.bilibili.com/x/frontend/finger/spi');
    const json = await res.json();
    cookie = `buvid3=${json.data.b_3};buvid4=${json.data.b_4}`;
  }
  if (cookiedSearch) {
    return `${cookie};SESSDATA=${await getBiliCookie('SESSDATA')}`;
  }
  return cookie;
};

export // eslint-disable-next-line @typescript-eslint/no-explicit-any
const fastSearchResolveBVID = async (bvobjs: any[]) => {
  /**
     * cids should be resolved at this stage,
     * or on the fly using fetchCID. the latter saves
     * search time but now song.id loses identification.
    const resolvedCIDs = await Promise.all(
      bvobjs.map(obj => fetchCID(obj.bvid))
    );
     */
  return bvobjs.map(
    obj =>
      new VideoInfo(
        obj.title.replaceAll(/<[^<>]*em[^<>]*>/g, ''),
        obj.description,
        1,
        `https:${obj.pic}`,
        { mid: obj.mid, name: obj.author, face: obj.upic },
        [
          {
            bvid: obj.bvid,
            part: '1',
            cid: `null-${obj.bvid}`, // resolvedCids[index]
            duration: timestampToSeconds(obj.duration),
          },
        ],
        obj.bvid,
        timestampToSeconds(obj.duration)
      )
  );
};

export const fetchBiliSearchList = async (
  kword: string,
  progressEmitter: (val: number) => void = () => undefined,
  fastSearch = false,
  cookiedSearch = false
) => {
  // this API needs a random buvid3 value, or a valid SESSDATA;
  // otherwise will return error 412. for users didnt login to bilibili,
  // setting a random buvid3 would enable this API.
  let val: VideoInfo[] = [];
  try {
    val = await fetchBiliPaginatedAPI({
      url: URL_BILI_SEARCH.replace('{keyword}', kword),
      getMediaCount: data => Math.min(data.numResults, data.pagesize * 2),
      getPageSize: data => data.pagesize,
      getItems: js => js.data.result,
      progressEmitter,
      favList: [],
      params: {
        method: 'GET',
        headers: {
          cookie: await getCookie(cookiedSearch),
        },
        referrer: 'https://www.bilibili.com',
        // HACK: setting to omit will use whatever cookie I set above.
        credentials: 'omit',
      },
      resolveBiliBVID: fastSearch
        ? async bvobjs => await fastSearchResolveBVID(bvobjs)
        : undefined,
    });
  } catch (e) {
    logger.error(e);
  }
  return val;
};

interface regexFetchProps {
  url: string;
  progressEmitter: (val: number) => void;
  fastSearch: boolean;
  cookiedSearch?: boolean;
}

const regexFetch = async ({
  url,
  progressEmitter = () => undefined,
  fastSearch,
  cookiedSearch = false,
}: regexFetchProps) => {
  return songFetch({
    videoinfos: await fetchBiliSearchList(
      url,
      progressEmitter,
      fastSearch,
      cookiedSearch
    ),
    useBiliTag: false,
    progressEmitter,
  });
};

const resolveURL = () => undefined;

const refreshSong = (song: NoxMedia.Song) => song;

export default {
  regexSearchMatch: /space.bilibili\.com\/(\d+)\/video/,
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
  refreshSong,
};
