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
import { songFetch, fetchVideoInfo } from './bilivideo';
import VideoInfo from 'objects/VideoInfo';
import { fetchBiliPaginatedAPI } from './paginatedbili';

const URL_FAV_LIST =
  'https://api.bilibili.com/x/v3/fav/resource/ids?media_id={mid}';

export const getFavListBVID = async (mid: string, favList: string[] = []) => {
  logger.info('calling fetchFavList');

  const res = await fetch(URL_FAV_LIST.replace('{mid}', mid));
  const json = await res.json();
  const data = json.data as { bvid: string }[];
  return data.map(val => val.bvid).filter(val => !favList.includes(val));
};

export const fetchFavList = async (
  mid: string,
  progressEmitter: (val: number) => void = () => undefined,
  favList: string[] = []
) => {
  const bvids = await getFavListBVID(mid, favList);
  const BVidPromises = bvids.map((val, i) =>
    fetchVideoInfo(val, () => {
      progressEmitter((100 * (i + 1)) / bvids.length);
    })
  );
  return (await Promise.all(BVidPromises)).filter(item => item) as VideoInfo[];
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
