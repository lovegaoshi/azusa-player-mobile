import steriatkFetch from './steriatk';
import biliaudioFetch from './biliaudio';
import ytbvideoFetch from '@utils/mediafetch/ytbvideo';
import bililiveFetch from './bililive';
import biliBangumiFetch from './biliBangumi';
import localFetch from '@utils/mediafetch/local';
import { logger } from '../Logger';
import { regexMatchOperations } from '../Utils';
import { resolver, MUSICFREE } from './musicfree';
import bilivideoFetch, { fetchVideoPlayUrlPromise } from './bilivideo';

// TODO: remove this, believe this is for legacy reasons?
export const ENUMS = {
  audioType: 'audio',
  youtube: 'youtube.video',
};

type regResolve = NoxUtils.RegexMatchResolve<
  Promise<NoxNetwork.ParsedNoxMediaURL>
>;
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
  const regexResolveURLs: regResolve = [
    [steriatkFetch.regexResolveURLMatch, steriatkFetch.resolveURL],
    [biliaudioFetch.regexResolveURLMatch, biliaudioFetch.resolveURL],
    [ytbvideoFetch.regexResolveURLMatch, ytbvideoFetch.resolveURL],
    [bililiveFetch.regexResolveURLMatch, bililiveFetch.resolveURL],
    [biliBangumiFetch.regexResolveURLMatch, biliBangumiFetch.resolveURL],
    [localFetch.regexResolveURLMatch, localFetch.resolveURL],
  ];
  const regexResolveURLsWrapped: regResolve = regexResolveURLs.map(entry => [
    entry[0],
    (song: NoxMedia.Song) => entry[1](song, iOS),
  ]);
  logger.debug(`[resolveURL] ${bvid}, ${cid} }`);

  const fallback = () => {
    const cidStr = String(cid);
    if (cidStr.startsWith(ENUMS.audioType)) {
      return biliaudioFetch.resolveURL(v);
    }
    return fetchVideoPlayUrlPromise({ bvid, cid: cidStr, iOS });
  };
  if (v.source && Object.values(MUSICFREE).includes(v.source as MUSICFREE)) {
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
    regexOperations: regexResolveURLsWrapped,
    fallback,
    regexMatching: song => song.id,
  });
};

export const refreshMetadata = async (
  v: NoxMedia.Song
): Promise<Partial<NoxMedia.Song>> => {
  const metadata = await fetchPlayUrlPromise(v);
  return {
    ...(metadata.cover && { cover: metadata.cover }),
    metadataOnLoad: false,
  };
};

export const songExport2URL = (v: NoxMedia.Song): string => {
  const regexOperations: NoxUtils.RegexMatchResolve<string> = [
    [biliaudioFetch.regexResolveURLMatch, biliaudioFetch.export2URL],
    [ytbvideoFetch.regexResolveURLMatch, ytbvideoFetch.export2URL],
    [biliBangumiFetch.regexResolveURLMatch, biliBangumiFetch.export2URL],
  ];

  return regexMatchOperations({
    song: v,
    regexOperations,
    fallback: bilivideoFetch.export2URL,
    regexMatching: song => song.id,
  });
};
export const songResolveArtwork = (v: NoxMedia.Song) => {
  const regexOperations: NoxUtils.RegexMatchResolve<Promise<string>> = [
    [localFetch.regexResolveURLMatch, localFetch.resolveArtwork],
  ];

  return regexMatchOperations({
    song: v,
    regexOperations,
    fallback: () => Promise.resolve(''),
    regexMatching: song => song.id,
  });
};
