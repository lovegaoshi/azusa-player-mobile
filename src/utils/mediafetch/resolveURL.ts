import steriatkFetch from './steriatk';
import biliaudioFetch from './biliaudio';
import ytbvideoFetch from './ytbvideo';
import bililiveFetch from './bililive';
import { logger } from '../Logger';
import { regexMatchOperations } from '../Utils';
import { resolver, MUSICFREE } from './mfsdk';
import { fetchVideoPlayUrlPromise } from './bilivideo';

// TODO: remove this, believe this is for legacy reasons?
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
export const fetchPlayUrlPromise = async (
  v: NoxMedia.Song,
  iOS = true
): Promise<NoxNetwork.ParsedNoxMediaURL> => {
  const bvid = v.bvid;
  const cid = v.id;
  const regexResolveURLs: NoxUtils.RegexMatchOperations<NoxNetwork.ParsedNoxMediaURL> =
    [
      [steriatkFetch.regexResolveURLMatch, steriatkFetch.resolveURL],
      [biliaudioFetch.regexResolveURLMatch, biliaudioFetch.resolveURL],
      [ytbvideoFetch.regexResolveURLMatch, ytbvideoFetch.resolveURL],
      [bililiveFetch.regexResolveURLMatch, bililiveFetch.resolveURL],
    ];
  logger.debug(`[resolveURL] ${bvid}, ${cid} }`);

  const fallback = () => {
    const cidStr = String(cid);
    if (cidStr.startsWith(ENUMS.audioType)) {
      return biliaudioFetch.resolveURL(v);
    }
    return fetchVideoPlayUrlPromise({ bvid, cid: cidStr, iOS });
  };

  if (v.source && v.source in MUSICFREE) {
    const vsource = v.source as MUSICFREE;
    const result = await resolver[vsource](v);
    console.warn(result, v);
    if (!result || result.url.length === 0) {
      logger.error(JSON.stringify(v));
      throw new Error(`[resolveURL] ${bvid}, ${cid} failed.`);
    }
    return result;
  }

  return regexMatchOperations({
    song: v,
    regexOperations: regexResolveURLs,
    fallback,
  });
};
