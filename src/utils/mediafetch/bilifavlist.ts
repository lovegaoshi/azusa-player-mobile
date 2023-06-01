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
import { fetchBiliPaginatedAPI } from './paginatedbili';

const URL_FAV_LIST =
  'https://api.bilibili.com/x/v3/fav/resource/list?media_id={mid}&pn={pn}&ps=20&keyword=&order=mtime&type=0&tid=0&platform=web&jsonp=jsonp';

export const fetchFavList = async (
  mid: string,
  progressEmitter: (val: number) => void = () => undefined,
  favList: string[] = []
) => {
  logger.info('calling fetchFavList');

  return fetchBiliPaginatedAPI({
    url: URL_FAV_LIST.replace('{mid}', mid),
    getMediaCount: data => data.info.media_count,
    getPageSize: () => 20,
    getItems: js => js.data.medias,
    progressEmitter,
    favList,
  });
};

const regexFetch = async ({
  reExtracted,
  progressEmitter = () => undefined,
  favList,
  useBiliTag,
}: regexFetchProps) => {
  return songFetch({
    videoinfos: await fetchFavList(reExtracted[1]!, progressEmitter, favList),
    useBiliTag: useBiliTag || false,
    progressEmitter,
  });
};

const resolveURL = () => undefined;

const refreshSong = (song: NoxMedia.Song) => song;

export default {
  regexSearchMatch: /.*bilibili\.com\/\d+\/favlist\?fid=(\d+)/,
  regexSearchMatch2: /.*bilibili\.com\/medialist\/detail\/ml(\d+)/,
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
  refreshSong,
};
