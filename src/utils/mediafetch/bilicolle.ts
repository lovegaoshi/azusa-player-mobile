/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { biliShazamOnSonglist } from './bilishazam';
import { fetchBiliPaginatedAPI } from './paginatedbili';

const URL_BILICOLLE_INFO =
  'https://api.bilibili.com/x/polymer/space/seasons_archives_list?mid={mid}&season_id={sid}&sort_reverse=true&page_num={pn}&page_size=100';

const fetchBiliColleList = (
  mid: string,
  sid: string,
  progressEmitter: (val: number) => void = () => undefined,
  favList: string[] = []
) => {
  logger.info('calling fetchBiliColleList');

  return fetchBiliPaginatedAPI({
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
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: await biliShazamOnSonglist(
    await fetchBiliColleList(
      reExtracted[1]!,
      reExtracted[2]!,
      progressEmitter,
      favList
    ),
    false,
    progressEmitter,
    useBiliTag || false
  ),
});

const resolveURL = () => undefined;

export default {
  regexSearchMatch:
    /space.bilibili\.com\/(\d+)\/channel\/collectiondetail\?sid=(\d+)/,
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
};
