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
import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';
import { i0hdslbHTTPResolve, timestampToSeconds } from '../Utils';
import { logger } from '@utils/Logger';
import { biliShazamOnSonglist } from './bilishazam';
import { fetchBiliPaginatedAPI } from './paginatedbili';
import { getBiliUser } from './biliuser';

const URL_BILICOLLE_INFO =
  'https://api.bilibili.com/x/polymer/space/seasons_archives_list?mid={mid}&season_id={sid}&sort_reverse=false&page_num={pn}&page_size=100';

const processMetadata = async (metadata: any) => {
  const userMetadata = await getBiliUser(metadata.meta.mid);
  return {
    ...metadata,
    uname: userMetadata.name,
  };
};

/**
 * its absolutely safe to not resolve bvids individually, as bilicolle
 * will never include videos w multiple episodes.
 * {
    "aid": 1805043280,
    "bvid": "BV1kb421q7x8",
    "ctime": 1716672875,
    "duration": 253,
    "interactive_video": false,
    "pic": "http://i0.hdslb.com/bfs/archive/15d7148c3dd0464aabcc4de9391647ac07f596ef.jpg",
    "pubdate": 1716696000,
    "stat": {
        "view": 103326
    },
    "state": 0,
    "title": "One Last Smoke（MV版）",
    "ugc_pay": 0
},
 */
const resolveBiliBVID = (objs: any[], _: any, rawData: any) =>
  objs.map(obj =>
    SongTS({
      cid: `null-${obj.bvid}`,
      bvid: obj.bvid,
      name: obj.title,
      nameRaw: obj.title,
      singer: rawData.uname,
      singerId: rawData.meta.mid,
      cover: i0hdslbHTTPResolve(obj.pic),
      lyric: '',
      page: 1,
      duration: obj.duration,
      album: obj.title,
      source: Source.bilivideo,
    })
  );

const fetchBiliColleList = (
  mid: string,
  sid: string,
  progressEmitter: NoxUtils.ProgressEmitter = () => undefined,
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
    resolveBiliBVID,
    processMetadata,
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
      reExtracted[1],
      reExtracted[2],
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
