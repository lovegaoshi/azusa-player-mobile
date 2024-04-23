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
import { regexFetchProps } from './generic';
import { biliShazamOnSonglist } from './bilishazam';
import { fetchBiliPaginatedAPI } from './paginatedbili';

const URL_BILICOLLE_INFO =
  'https://api.bilibili.com/x/space/fav/season/list?season_id={sid}&pn={pn}&ps=100';

const fetchBiliColleList = async (
  mid: string,
  sid: string,
  progressEmitter: (val: number) => void = () => undefined,
  favList: string[] = []
) => {
  logger.info('calling fetchBiliColleList');

  return await fetchBiliPaginatedAPI({
    url: URL_BILICOLLE_INFO.replace('{sid}', sid),
    getMediaCount: (data: any) => data.info.media_count,
    getPageSize: () => 100,
    getItems: (js: any) => js.data.medias,
    progressEmitter,
    favList,
  });
};

const regexFetch = async ({
  reExtracted,
  progressEmitter = () => undefined,
  favList,
  useBiliTag,
}: regexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
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
  regexSearchMatch: /.*bilibili\.com\/\d+\/favlist\?fid=(\d+)&ftype=collect/,
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
};
