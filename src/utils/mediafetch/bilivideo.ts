/* eslint-disable @typescript-eslint/no-explicit-any */

import { biliApiLimiter } from './throttle';
import { biliShazamOnSonglist } from './bilishazam';
import { logger } from '../Logger';
import bfetch from '@utils/BiliFetch';
import { wbiQuery } from '@stores/wbi';
import { fetchBVIDRaw } from '@utils/mediafetch/biliVideoInfo';

export enum FieldEnum {
  AudioUrl = 'AudioUrl',
  VideoUrl = 'VideoUrl',
  CID = 'CID',
  AudioInfo = 'AudioInfo',
}

const URL_PLAY_URL =
  'https://api.bilibili.com/x/player/wbi/playurl?cid={cid}&bvid={bvid}&qn=64&fnval=16&try_look=1&voice_balance=1';
const URL_PLAY_URL_IOS =
  'https://api.bilibili.com/x/player/wbi/playurl?cid={cid}&bvid={bvid}&qn=6&fnval=16&platform=html5&voice_balance=1';

export const fetchBVID = (
  bvid: string,
  progressEmitter: () => void = () => undefined,
) =>
  biliApiLimiter.schedule(() => {
    progressEmitter();
    return fetchBVIDRaw(bvid);
  });

export const fetchBiliBVIDs = async (
  BVids: string[],
  progressEmitter: NoxUtils.ProgressEmitter = () => undefined,
  useBiliTag = false,
) => {
  const BVidLen = BVids.length;
  const BVidPromises = BVids.map((bvid, index) =>
    fetchBVID(bvid, () => progressEmitter((100 * (index + 1)) / BVidLen)),
  );
  const songs = (await Promise.all(BVidPromises)).flat();
  return biliShazamOnSonglist(songs, false, progressEmitter, useBiliTag);
};

interface BVRegFetchProps extends NoxNetwork.RegexFetchProps {
  bvids: string[];
}

export const bvFetch = async ({
  bvids,
  useBiliTag,
  progressEmitter = () => undefined,
}: BVRegFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: await fetchBiliBVIDs(bvids, progressEmitter, useBiliTag),
});

const regexFetch = ({ reExtracted, useBiliTag }: NoxNetwork.RegexFetchProps) =>
  bvFetch({
    reExtracted,
    useBiliTag,
    bvids: [reExtracted[1]],
  });

interface FetchPlayURL {
  bvid: string;
  cid?: string;
  extractType?: string;
  // enable iOS HLS fix.
  // iOS does not play some DASH formats, so we resort to whatever html5 can play -
  // 360p mp4.
  iOS?: boolean;
  noBiliR128Gain?: boolean;
}

export const fetchVideoPlayUrl = (bvid: string, iOS = false) =>
  fetchVideoPlayUrlPromise({ bvid, extractType: FieldEnum.VideoUrl, iOS }).then(
    v => v.url,
  );
export const fetchVideoPlayUrlPromise = async ({
  bvid,
  cid,
  extractType = FieldEnum.AudioUrl,
  iOS = false,
  noBiliR128Gain = false,
}: FetchPlayURL): Promise<NoxNetwork.ParsedNoxMediaURL> => {
  logger.debug(
    `fethcVideoPlayURL: ${URL_PLAY_URL.replace('{bvid}', bvid).replace(
      '{cid}',
      String(cid),
    )} with ${extractType}`,
  );
  try {
    // HACK:  this should be a breaking change that stringified cid
    // will never be not true.
    if (!cid || cid.includes('null')) {
      cid = await fetchCID(bvid);
      logger.debug(`[resolveURL] cid resolved to be: ${cid}`);
    }
    // iOS: resolve lowest res video?
    if (iOS) {
      const res = await wbiQuery(
        URL_PLAY_URL_IOS.replace('{bvid}', bvid).replace('{cid}', String(cid)),
        {
          method: 'GET',
          headers: {},
          credentials: 'omit',
        },
      );
      const json = await res.json();
      logger.debug(`[iOS resolveURL] ${JSON.stringify(json.data)}`);
      return { url: json.data.durl[0].url as string };
    }
    const res = await wbiQuery(
      URL_PLAY_URL.replace('{bvid}', bvid).replace('{cid}', String(cid)),
      // to resolve >480p video sources
      {
        method: 'GET',
        headers: {},
        credentials: extractType === FieldEnum.AudioUrl ? 'omit' : 'include',
      },
    );
    const json = await res.json();
    return {
      url: extractResponseJson(json, extractType) as string,
      loudness: noBiliR128Gain
        ? undefined
        : json.data?.volume?.target_i - json.data?.volume?.measured_i,
    };
  } catch (e) {
    logger.error(`[resolveURL] error: ${e} of bvid:${bvid}, cid:${cid}`);
    throw e;
  }
};

export const fetchCID = async (bvid: string) => {
  // logger.log('Data.js Calling fetchCID:' + URL_BVID_TO_CID.replace("{bvid}", bvid))
  const res = await bfetch(
    `https://api.bilibili.com/x/player/pagelist?bvid=${bvid}&jsonp=jsonp`,
  );
  const json = await res.json();
  const cid = extractResponseJson(json, FieldEnum.CID);
  return cid;
};

/**
 * Private Util to extract json, see https://github.com/SocialSisterYi/bilibili-API-collect
 */
const extractResponseJson = (json: any, field: string) => {
  const getBestBitrate = (data: any[]) =>
    data.sort((a, b) => b.bandwidth - a.bandwidth)[0];

  switch (field) {
    case FieldEnum.AudioUrl:
      if (!json.data)
        throw new Error(
          `[extractResponseJson] no audio url from ${JSON.stringify(json)}`,
        );
      if (json.data.flac?.audio) {
        return getBestBitrate(json.data.dash.flac.audio).baseUrl;
      } else if (json.data.dolby?.audio) {
        return getBestBitrate(json.data.dash.dolby.audio).baseUrl;
      }
      if (json.data.dash) return getBestBitrate(json.data.dash.audio).baseUrl;
      if (json.data.durl) return json.data.durl[0].url;
      throw new Error(
        `[extractResponseJson] no audio url from ${JSON.stringify(json)}`,
      );
    case FieldEnum.VideoUrl:
      return json.data.dash.video[0].baseUrl;
    case FieldEnum.CID:
      return json.data[0].cid;
    case FieldEnum.AudioInfo:
      return {};
    default:
      throw new Error(
        `invalid field type: ${field} to parse JSON response from ${json}`,
      );
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
