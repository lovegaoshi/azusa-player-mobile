import steriatkFetch from './steriatk';
import biliaudioFetch from './biliaudio';
import ytbvideoFetch from './ytbvideo';
import { logger } from '../Logger';
import bfetch from '../BiliFetch';

/**
 *  Video src info
 */
const URL_PLAY_URL =
  'https://api.bilibili.com/x/player/playurl?cid={cid}&bvid={bvid}&qn=64&fnval=16';

/**
 *  bilibili API to get an audio's stream src url.
 * https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/audio/musicstream_url.md
 * https://api.bilibili.com/audio/music-service-c/url doesnt work.
 * au must be removed, eg. https://www.bilibili.com/audio/music-service-c/web/url?sid=745350
 */
const URL_AUDIO_PLAY_URL =
  'https://www.bilibili.com/audio/music-service-c/web/url?sid={sid}';
/**
 *  BVID -> CID
 */
const URL_BVID_TO_CID =
  'https://api.bilibili.com/x/player/pagelist?bvid={bvid}&jsonp=jsonp';

export const ENUMS = {
  audioType: 'audio',
  youtube: 'youtube.video',
};

/**
 * a parent method that returns the media's stream url given an id.
 * @param {string} bvid media's id.
 * @param {string} cid optional in video; if not provided, bvid is used to fetch cid. note
 * some videos have episodes that this may not be accurate. in other formats (eg biliAudio)
 * its used as an identifier.
 * @returns promise that resolves the media stream url.
 */
export const fetchPlayUrlPromise = async (v: NoxMedia.Song) => {
  const bvid = v.bvid;
  const cid = v.id;
  const regexResolveURLs: Array<
    [RegExp, (song: NoxMedia.Song) => string | Promise<string>]
  > = [
    [steriatkFetch.regexResolveURLMatch, steriatkFetch.resolveURL],
    [biliaudioFetch.regexResolveURLMatch, biliaudioFetch.resolveURL],
    [ytbvideoFetch.regexResolveURLMatch, ytbvideoFetch.resolveURL],
  ];
  logger.debug({ bvid, cid });
  for (const reExtraction of regexResolveURLs) {
    const reExtracted = reExtraction[0].exec(cid);
    if (reExtracted !== null) {
      return reExtraction[1](v);
    }
  }
  const cidStr = String(cid);
  if (cidStr.startsWith(ENUMS.audioType)) {
    return fetchAudioPlayUrlPromise(bvid);
  }
  return fetchVideoPlayUrlPromise(bvid, cidStr);
};

/**
 * returns the bilibili video stream url given a bvid and cid.
 * @param {string} bvid video's bvid. starts with BV.
 * @param {string | undefined} cid optional; if not provided, bvid is used to fetch cid. note
 * some videos have episodes that this may not be accurate.
 * @returns
 */
export const fetchVideoPlayUrlPromise = async (
  bvid: string,
  cid?: string,
  extractType = 'AudioUrl'
) => {
  logger.debug(
    `fethcVideoPlayURL: ${URL_PLAY_URL.replace('{bvid}', bvid).replace(
      '{cid}',
      String(cid)
    )} with ${extractType}`
  );
  // HACK:  this should be a breaking change that stringified cid
  // will never be not true.
  if (!cid || cid.includes('null')) {
    cid = await fetchCID(bvid);
  }
  try {
    const res = await bfetch(
      URL_PLAY_URL.replace('{bvid}', bvid).replace('{cid}', String(cid)),
      // to resolve >480p video sources
      {
        method: 'GET',
        headers: {},
        credentials: extractType === 'AudioUrl' ? 'omit' : 'include',
      }
    );
    const json = await res.json();
    return extractResponseJson(json, extractType);
  } catch (e) {
    logger.error(e);
    throw e;
  }
};

/**
 * returns the bilibili audio stream url given a auid/sid.
 * @param {string} bvid audio's auid. starts with AU. eg.
 * https://www.bilibili.com/audio/au745350
 * @returns
 */
export const fetchAudioPlayUrlPromise = async (sid: string) => {
  try {
    logger.debug(
      `fethcAudioPlayURL:${URL_AUDIO_PLAY_URL.replace('{sid}', sid)}`
    );
    const res = await bfetch(URL_AUDIO_PLAY_URL.replace('{sid}', sid));
    const json = await res.json();
    return json.data.cdns[0];
  } catch (e) {
    logger.error(e);
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
  const res = await bfetch(URL_BVID_TO_CID.replace('{bvid}', bvid));
  const json = await res.json();
  const cid = extractResponseJson(json, 'CID');
  return cid;
};

/**
 * Private Util to extract json, see https://github.com/SocialSisterYi/bilibili-API-collect
 * @param {Object} json
 * @param {string} field
 * @returns
 */
const extractResponseJson = (json: any, field: string) => {
  switch (field) {
    case 'AudioUrl':
      return json.data.dash.audio[0].baseUrl;
    case 'VideoUrl':
      return json.data.dash.video[0].baseUrl;
    case 'CID':
      return json.data[0].cid;
    case 'AudioInfo':
      return {};
    default:
      throw new Error(`invalid field type: ${field} to parse JSON response`);
  }
};
