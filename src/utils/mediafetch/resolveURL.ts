import steriatkFetch from './steriatk';
import biliaudioFetch from './biliaudio';
import ytbvideoFetch from '@utils/mediafetch/ytbvideo';
import bililiveFetch from './bililive';
import biliBangumiFetch from './biliBangumi';
import localFetch from '@utils/mediafetch/local';
import headRequestFetch from './headRequest';
import { logger } from '../Logger';
import { regexMatchOperations } from '../Utils';
import { resolver, MUSICFREE } from './musicfree';
import bilivideoFetch, { fetchVideoPlayUrlPromise } from './bilivideo';
import { NULL_TRACK } from '@objects/Song';

// TODO: remove this, believe this is for legacy reasons?
export const ENUMS = {
  audioType: 'audio',
  youtube: 'youtube.video',
};

type regResolve = NoxUtils.RegexMatchResolve<
  Promise<NoxNetwork.ParsedNoxMediaURL>
>;

const regexResolveURLs: regResolve = [
  [steriatkFetch.regexResolveURLMatch, steriatkFetch.resolveURL],
  [biliaudioFetch.regexResolveURLMatch, biliaudioFetch.resolveURL],
  [ytbvideoFetch.regexResolveURLMatch, ytbvideoFetch.resolveURL],
  [ytbvideoFetch.regexResolveURLMatch2, ytbvideoFetch.resolveURL],
  [bililiveFetch.regexResolveURLMatch, bililiveFetch.resolveURL],
  [biliBangumiFetch.regexResolveURLMatch, biliBangumiFetch.resolveURL],
  [headRequestFetch.regexResolveURLMatch, headRequestFetch.resolveURL],
  [localFetch.regexResolveURLMatch, localFetch.resolveURLPrefetch],
];

interface FetchPlayUrl {
  song: NoxMedia.Song;
  iOS?: boolean;
  prefetch?: boolean;
}
/**
 * a parent method that returns the media's stream url given an id.
 * some videos have episodes that cid may not be accurate. in other formats (eg biliAudio)
 * its used as an identifier.
 */
export const fetchPlayUrlPromise = async ({
  song,
  iOS = true,
}: FetchPlayUrl): Promise<NoxNetwork.ParsedNoxMediaURL> => {
  const bvid = song.bvid;
  const cid = song.id;
  const resolveUrlArray = regexResolveURLs;
  const regexResolveURLsWrapped: regResolve = resolveUrlArray.map(entry => [
    entry[0],
    (song: NoxMedia.Song) => entry[1](song, iOS),
  ]);
  logger.debug(`[resolveURL] ${bvid}, ${cid} }`);

  const fallback = () => {
    const cidStr = String(cid);
    if (cidStr.startsWith(ENUMS.audioType)) {
      return biliaudioFetch.resolveURL(song);
    }
    return fetchVideoPlayUrlPromise({ bvid, cid: cidStr, iOS });
  };

  if (
    song.source &&
    Object.values(MUSICFREE).includes(song.source as MUSICFREE)
  ) {
    const vsource = song.source as MUSICFREE;
    const result = await resolver[vsource](song);
    console.warn(result, song);
    if (!result || result.url.length === 0) {
      logger.error(JSON.stringify(song));
      throw new Error(`[resolveURL] ${bvid}, ${cid} failed.`);
    }
    return result;
  }

  return regexMatchOperations({
    song,
    regexOperations: regexResolveURLsWrapped,
    fallback,
    regexMatching: song => song.id,
  }).catch(() => NULL_TRACK);
};

export const refreshMetadata = async (
  song: NoxMedia.Song
): Promise<Partial<NoxMedia.Song>> => {
  const metadata = await fetchPlayUrlPromise({ song });
  return {
    ...(metadata.cover && { cover: metadata.cover }),
    metadataOnLoad: false,
  };
};

const regexExportURLs: NoxUtils.RegexMatchResolve<string> = [
  [biliaudioFetch.regexResolveURLMatch, biliaudioFetch.export2URL],
  [ytbvideoFetch.regexResolveURLMatch, ytbvideoFetch.export2URL],
  [biliBangumiFetch.regexResolveURLMatch, biliBangumiFetch.export2URL],
];

export const songExport2URL = (v: NoxMedia.Song): string => {
  return regexMatchOperations({
    song: v,
    regexOperations: regexExportURLs,
    fallback: bilivideoFetch.export2URL,
    regexMatching: song => song.id,
  });
};

const regexResolveArtworks: NoxUtils.RegexMatchResolve<
  Promise<string | undefined>
> = [[localFetch.regexResolveURLMatch, localFetch.resolveArtwork]];

export const songResolveArtwork = (v?: NoxMedia.Song) => {
  if (!v) return;

  return regexMatchOperations({
    song: v,
    regexOperations: regexResolveArtworks,
    fallback: async () => undefined,
    regexMatching: song => song.id,
  });
};
