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
import { SOURCE } from '@enums/MediaFetch';
import { logger } from '../Logger';
import { regexFetchProps } from './generic';
import { fetchAwaitBiliPaginatedAPI } from './paginatedbili';
import { awaitLimiter } from './throttle';
import SongTS from '@objects/Song';

// https://api.bilibili.com/audio/music-service/web/song/upper?uid=741520&pn=1&ps=70&order=1
const URL_BILICHANNEL_AUDIO_INFO =
  'https://api.bilibili.com/audio/music-service/web/song/upper?uid=741520&pn={pn}&ps=30&order=1';
const CIDPREFIX = 'biliaudio-';

// i'm not going to pretend this songFetch stuff is not stupid and just bypass any of them here.
// key is to ignore resolveBiliBVID and set as (val) => val; then completely bypass VideoInfo
const songFetch = async ({
  videoinfos,
}: {
  videoinfos: any[];
  useBiliTag: boolean;
}) => {
  const aggregateVideoInfo = (info: any) => {
    return [
      SongTS({
        cid: `${CIDPREFIX}-${info.id}`,
        bvid: info.id,
        name: info.title,
        nameRaw: info.title,
        singer: info.uname,
        singerId: info.uid,
        cover: info.cover,
        lyric: '',
        page: 1,
        duration: info.duration,
        album: info.title,
        source: SOURCE.biliaudio,
      }),
    ];
  };
  const songs = videoinfos.reduce(
    (acc, curr) => acc.concat(aggregateVideoInfo(curr)),
    [] as NoxMedia.Song[]
  );
  return songs;
};

export const fetchBiliChannelAudioList = async (
  mid: string,
  progressEmitter: (val: number) => void = () => undefined,
  favList: string[] = []
) => {
  logger.info('calling fetchBiliChannelList');
  return fetchAwaitBiliPaginatedAPI({
    url: URL_BILICHANNEL_AUDIO_INFO.replace('{mid}', mid),
    getMediaCount: data => data.totalSize,
    getPageSize: data => data.pageSize,
    getItems: js => js.data.data,
    progressEmitter,
    favList,
    limiter: awaitLimiter,
    resolveBiliBVID: val => val,
  });
};

const regexFetch = async ({
  reExtracted,
  progressEmitter = () => undefined,
  favList,
  useBiliTag,
}: regexFetchProps) => {
  return songFetch({
    videoinfos: await fetchBiliChannelAudioList(
      reExtracted[1]!,
      progressEmitter,
      favList
    ),
    useBiliTag: useBiliTag || false,
  });
};

const resolveURL = () => undefined;

const refreshSong = (song: NoxMedia.Song) => song;

export default {
  regexSearchMatch: /space.bilibili\.com\/(\d+)\/audio/,
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
  refreshSong,
};
