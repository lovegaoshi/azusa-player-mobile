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

const URL_BILICOLLE_INFO =
  'https://api.bilibili.com/x/polymer/space/seasons_archives_list?mid={mid}&season_id={sid}&sort_reverse=false&page_num={pn}&page_size=100';

const fetchBiliColleList = async (
  mid: string,
  sid: string,
  progressEmitter: (val: number) => void = () => undefined,
  favList: string[] = []
) => {
  logger.info('calling fetchBiliColleList');

  return await fetchBiliPaginatedAPI({
    url: URL_BILICOLLE_INFO.replace('{mid}', mid).replace('{sid}', sid),
    getMediaCount: (data: any) => data.meta.total,
    getPageSize: (data: any) => data.page.page_size,
    getItems: (js: any) => js.data.archives,
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
    videoinfos: await fetchBiliColleList(
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
    /space.bilibili\.com\/(\d+)\/channel\/collectiondetail\?sid=(\d+)/,
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
  refreshSong,
};
