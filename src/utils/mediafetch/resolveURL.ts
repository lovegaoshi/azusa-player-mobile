import steriatkFetch from './steriatk';
import biliaudioFetch from './biliaudio';
import ytbvideoFetch, { fetchAudioInfo } from '@utils/mediafetch/ytbvideo';
import bililiveFetch from './bililive';
import biliBangumiFetch from './biliBangumi';
import localFetch from '@utils/mediafetch/local';
import alistFetch from './alist';
import { resolver, MUSICFREE } from '@utils/mediafetch/musicfree';
import headRequestFetch from './headRequest';
import { logger } from '../Logger';
import { regexMatchOperations } from '../Utils';
import bilivideoFetch, {
  fetchVideoPlayUrlPromise as fetchBiliUrlPromise,
} from './bilivideo';
import acfunFetch from './acfunvideo';
import { NULL_TRACK } from '@objects/Song';

const MUSICFREESources: NoxMedia.SongSource[] = Object.values(MUSICFREE);

type RegResolve = NoxUtils.RegexMatchResolve<
  Promise<NoxNetwork.ParsedNoxMediaURL>
>;

const regexResolveURLs: RegResolve = [
  [acfunFetch.regexResolveURLMatch, acfunFetch.resolveURL],
  [steriatkFetch.regexResolveURLMatch, steriatkFetch.resolveURL],
  [biliaudioFetch.regexResolveURLMatch, biliaudioFetch.resolveURL],
  [ytbvideoFetch.regexResolveURLMatch, ytbvideoFetch.resolveURL],
  [ytbvideoFetch.regexResolveURLMatch2, ytbvideoFetch.resolveURL],
  [bililiveFetch.regexResolveURLMatch, bililiveFetch.resolveURL],
  [biliBangumiFetch.regexResolveURLMatch, biliBangumiFetch.resolveURL],
  [headRequestFetch.regexResolveURLMatch, headRequestFetch.resolveURL],
  [localFetch.regexResolveURLMatch, localFetch.resolveURLPrefetch],
  [alistFetch.regexResolveURLMatch, alistFetch.resolveURL],
];

const regexRefreshMetadata: NoxUtils.RegexMatchResolve<
  Promise<Partial<NoxMedia.Song>>
> = [
  [
    ytbvideoFetch.regexResolveURLMatch,
    async s => (await fetchAudioInfo(s.bvid))[0],
  ],
  [
    ytbvideoFetch.regexResolveURLMatch2,
    async s => (await fetchAudioInfo(s.bvid))[0],
  ],
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
  iOS = false,
}: FetchPlayUrl): Promise<NoxNetwork.ParsedNoxMediaURL> => {
  const bvid = song.bvid;
  const cid = song.id;
  const resolveUrlArray = regexResolveURLs;
  const regexResolveURLsWrapped: RegResolve = resolveUrlArray.map(entry => [
    entry[0],
    (song: NoxMedia.Song) => entry[1](song, iOS),
  ]);
  logger.debug(`[resolveURL] ${bvid}, ${cid} }`);

  const fallback = () => fetchBiliUrlPromise({ bvid, cid: String(cid), iOS });

  if (song.source && MUSICFREESources.includes(song.source)) {
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
  song: NoxMedia.Song,
): Promise<Partial<NoxMedia.Song>> => {
  logger.debug(`[refreshMetadata] ${song.id}`);
  const metadata = await regexMatchOperations({
    song,
    regexOperations: regexRefreshMetadata,
    regexMatching: song => song.id,
    fallback: async (): Promise<Partial<NoxMedia.Song>> => {
      logger.warn(`[refreshMetadata] ${song.id} did not match regex`);
      return {};
    },
  });
  return {
    ...metadata,
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

const regexResolveArtworks: NoxUtils.RegexMatchResolve<Promise<string | void>> =
  [[localFetch.regexResolveURLMatch, localFetch.resolveArtwork]];

export const songResolveArtwork = (v?: NoxMedia.Song) => {
  if (!v) return;

  return regexMatchOperations({
    song: v,
    regexOperations: regexResolveArtworks,
    fallback: async () => undefined,
    regexMatching: song => song.id,
  });
};
