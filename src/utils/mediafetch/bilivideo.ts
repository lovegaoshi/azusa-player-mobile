/* eslint-disable @typescript-eslint/no-explicit-any */
import { Platform } from 'react-native';

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
import { regexFetchProps } from './generic';
import { biliApiLimiter } from './throttle';
import { biliShazamOnSonglist } from './bilishazam';
import VideoInfo from '@objects/VideoInfo';
import SongTS from '@objects/Song';
import { logger } from '../Logger';
import bfetch from '@utils/BiliFetch';
import { SOURCE } from '@enums/MediaFetch';

export enum FieldEnum {
  AudioUrl = 'AudioUrl',
  VideoUrl = 'VideoUrl',
  CID = 'CID',
  AudioInfo = 'AudioInfo',
}

const URL_VIDEO_INFO =
  'https://api.bilibili.com/x/web-interface/view?bvid={bvid}';
const URL_PLAY_URL =
  'https://api.bilibili.com/x/player/playurl?cid={cid}&bvid={bvid}&qn=64&fnval=16&try_look=1';
const URL_PLAY_URL_IOS =
  'https://api.bilibili.com/x/player/playurl?cid={cid}&bvid={bvid}&qn=6&fnval=16&platform=html5';

const fetchVideoInfoRaw = async (bvid: string) => {
  logger.info(
    `calling fetchVideoInfo of ${bvid} of ${URL_VIDEO_INFO.replace(
      '{bvid}',
      bvid
    )}`
  );
  try {
    const res = await bfetch(URL_VIDEO_INFO.replace('{bvid}', bvid));
    const json = await res.json();
    const { data } = json;
    const v = new VideoInfo(
      data.title,
      data.desc,
      data.videos,
      data.pic,
      data.owner,
      data.pages.map((s: any) => {
        return { bvid, part: s.part, cid: s.cid, duration: s.duration };
      }),
      bvid,
      data.duration
    );
    return v;
  } catch (error: any) {
    logger.error(error.message);
    logger.warn(`Some issue happened when fetching ${bvid}`);
    // throw error;
  }
};

export const fetchVideoInfo = async (
  bvid: string,
  progressEmitter: () => void = () => undefined
) =>
  await biliApiLimiter.schedule(() => {
    progressEmitter();
    return fetchVideoInfoRaw(bvid);
  });

export const fetchBiliBVIDs = async (
  BVids: string[],
  progressEmitter: (val: number) => void = () => undefined
) => {
  const BVidLen = BVids.length;
  const BVidPromises = BVids.map((bvid, index) =>
    fetchVideoInfo(bvid, () => progressEmitter((100 * (index + 1)) / BVidLen))
  );
  const resolvedBVIDs = await Promise.all(BVidPromises);
  return resolvedBVIDs.filter(val => val) as VideoInfo[];
};

export const songFetch = async ({
  videoinfos,
  useBiliTag,
  progressEmitter = () => undefined,
}: {
  videoinfos: VideoInfo[];
  useBiliTag: boolean;
  progressEmitter?: (val: number) => void;
}) => {
  const aggregateVideoInfo = (info: VideoInfo) =>
    info.pages.map((page: any, index: number) => {
      const filename = info.pages.length === 1 ? info.title : page.part;
      return SongTS({
        cid: page.cid,
        bvid: info.bvid,
        name: filename,
        nameRaw: filename,
        singer: info.uploader.name,
        singerId: info.uploader.mid,
        cover: info.picSrc,
        lyric: '',
        page: index + 1,
        duration: page.duration,
        album: info.title,
        source: SOURCE.bilivideo,
      });
    });
  let songs = videoinfos.reduce(
    (acc, curr) => acc.concat(aggregateVideoInfo(curr)),
    [] as NoxMedia.Song[]
  );
  if (useBiliTag)
    songs = await biliShazamOnSonglist(songs, false, progressEmitter);
  return songs;
};

interface BVRegFetchProps extends regexFetchProps {
  bvids: string[];
}

export const bvFetch = async ({
  bvids,
  useBiliTag,
  progressEmitter = () => undefined,
}: BVRegFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: await songFetch({
    videoinfos: await fetchBiliBVIDs(bvids, progressEmitter), // await fetchiliBVID([reExtracted[1]!])
    useBiliTag: useBiliTag || false,
    progressEmitter,
  }),
});

const regexFetch = ({ reExtracted, useBiliTag }: regexFetchProps) =>
  bvFetch({
    reExtracted,
    useBiliTag,
    bvids: [reExtracted[1]!],
  });

interface FetchPlayURL {
  bvid: string;
  cid?: string;
  extractType?: string;
  // enable iOS HLS fix.
  iOS?: boolean;
}

export const fetchVideoPlayUrl = async (bvid: string) =>
  (await fetchVideoPlayUrlPromise({ bvid, extractType: FieldEnum.VideoUrl }))
    .url;
export const fetchVideoPlayUrlPromise = async ({
  bvid,
  cid,
  extractType = FieldEnum.AudioUrl,
  iOS = true,
}: FetchPlayURL) => {
  logger.debug(
    `fethcVideoPlayURL: ${URL_PLAY_URL.replace('{bvid}', bvid).replace(
      '{cid}',
      String(cid)
    )} with ${extractType}`
  );
  try {
    // HACK:  this should be a breaking change that stringified cid
    // will never be not true.
    if (!cid || cid.includes('null')) {
      cid = await fetchCID(bvid);
      logger.debug(`[resolveURL] cid resolved to be: ${cid}`);
    }
    // iOS: resolve lowest res video?
    if (iOS && Platform.OS === 'ios') {
      const res = await bfetch(
        URL_PLAY_URL_IOS.replace('{bvid}', bvid).replace('{cid}', String(cid)),
        {
          method: 'GET',
          headers: {},
          credentials: 'omit',
        }
      );
      const json = await res.json();
      logger.debug(`[iOS resolveURL] ${JSON.stringify(json.data)}`);
      return { url: json.data.durl[0].url as string };
    }
    const res = await bfetch(
      URL_PLAY_URL.replace('{bvid}', bvid).replace('{cid}', String(cid)),
      // to resolve >480p video sources
      {
        method: 'GET',
        headers: {},
        credentials: extractType === FieldEnum.AudioUrl ? 'omit' : 'include',
      }
    );
    const json = await res.json();
    return { url: extractResponseJson(json, extractType) as string };
  } catch (e) {
    logger.error(`[resolveURL] error: ${e}`);
    throw e;
  }
};

/**
 *
 * @param {string} bvid
 * @returns
 */
export const fetchCID = async (bvid: string) => {
  // logger.log('Data.js Calling fetchCID:' + URL_BVID_TO_CID.replace("{bvid}", bvid))
  const res = await bfetch(
    `https://api.bilibili.com/x/player/pagelist?bvid=${bvid}&jsonp=jsonp`
  );
  const json = await res.json();
  const cid = extractResponseJson(json, FieldEnum.CID);
  return cid;
};

/**
 * Private Util to extract json, see https://github.com/SocialSisterYi/bilibili-API-collect
 * @param {Object} json
 * @param {string} field
 * @returns
 */
const extractResponseJson = (json: any, field: string) => {
  const getBestBitrate = (data: any[]) =>
    data.sort((a, b) => b.bandwidth - a.bandwidth)[0];

  switch (field) {
    case FieldEnum.AudioUrl:
      if (json.data.flac?.audio) {
        return getBestBitrate(json.data.dash.flac.audio).baseUrl;
      } else if (json.data.dolby?.audio) {
        return getBestBitrate(json.data.dash.dolby.audio).baseUrl;
      }
      return getBestBitrate(json.data.dash.audio).baseUrl;
    case FieldEnum.VideoUrl:
      return json.data.dash.video[0].baseUrl;
    case FieldEnum.CID:
      return json.data[0].cid;
    case FieldEnum.AudioInfo:
      return {};
    default:
      throw new Error(`invalid field type: ${field} to parse JSON response`);
  }
};

const resolveURL = () => undefined;

const refreshSong = (song: NoxMedia.Song) => song;

const export2URL = (song: NoxMedia.Song) =>
  `https://www.bilibili.com/video/${song.bvid}${
    song.page ? `?p=${song.page}` : ''
  }`;
export default {
  regexSearchMatch: /(BV[^/?]+)/,
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
  refreshSong,
  export2URL,
};
