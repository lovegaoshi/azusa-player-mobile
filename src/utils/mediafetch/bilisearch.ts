import { logger } from '../Logger';
import { fetchBiliPaginatedAPI } from './paginatedbili';
import { timestampToSeconds } from '../Utils';
import bfetch from '../BiliFetch';
import { getBiliCookie } from '@utils/Bilibili/biliCookies';
import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';

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
const fastSearchResolveBVID = (bvobjs: any[]) => {
  /**
     * cids should be resolved at this stage,
     * or on the fly using fetchCID. the latter saves
     * search time but now song.id loses identification.
    const resolvedCIDs = await Promise.all(
      bvobjs.map(obj => fetchCID(obj.bvid))
    );
     */
  return bvobjs.map(obj => {
    const name = obj.title.replaceAll(/<[^<>]*em[^<>]*>/g, '');
    return SongTS({
      cid: `null-${obj.bvid}`,
      bvid: obj.bvid,
      name: name,
      nameRaw: name,
      singer: obj.author,
      singerId: obj.mid,
      cover: `https:${obj.pic}`,
      lyric: '',
      page: 1,
      duration: timestampToSeconds(obj.duration),
      album: name,
      source: Source.bilivideo,
    });
  });
};

export const fetchBiliSearchList = async (
  kword: string,
  progressEmitter: (val: number) => void = () => undefined,
  fastSearch = false,
  cookiedSearch = false,
  startPage = 1
): Promise<NoxMedia.Song[]> => {
  // this API needs a random buvid3 value, or a valid SESSDATA;
  // otherwise will return error 412. for users didnt login to bilibili,
  // setting a random buvid3 would enable this API.
  try {
    return fetchBiliPaginatedAPI({
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
        ? async bvobjs => fastSearchResolveBVID(bvobjs)
        : undefined,
      startPage,
    });
  } catch (e) {
    logger.error(e);
  }
  return [];
};

interface RegexFetchProps {
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
}: RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: await fetchBiliSearchList(
    url,
    progressEmitter,
    fastSearch,
    cookiedSearch
  ),
  refresh: v => refresh({ v, fastSearch, cookiedSearch }),
  refreshToken: [url, 3],
});

interface RefreshProps {
  v: NoxMedia.Playlist;
  fastSearch: boolean;
  cookiedSearch?: boolean;
}
const refresh = async ({ v, fastSearch, cookiedSearch }: RefreshProps) => {
  const results: NoxMedia.SearchPlaylist = { songList: [] };
  if (v.refreshToken) {
    const [url, startPage] = v.refreshToken;
    results.songList = await fetchBiliSearchList(
      url,
      undefined,
      fastSearch,
      cookiedSearch,
      startPage
    );
    results.refreshToken = [url, startPage + 2];
  }
  return results;
};

const resolveURL = () => undefined;

export default {
  regexSearchMatch: /space.bilibili\.com\/(\d+)\/video/,
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
};
