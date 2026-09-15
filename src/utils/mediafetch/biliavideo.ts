import { biliApiLimiter } from './throttle';
import { biliShazamOnSonglist } from './bilishazam';
import { fetchAVIDRaw } from '@utils/mediafetch/biliVideoInfo';

export const fetchAVID = (
  avid: string,
  progressEmitter: () => void = () => undefined,
) =>
  biliApiLimiter.schedule(() => {
    progressEmitter();
    return fetchAVIDRaw(avid);
  });

export const fetchBiliAVIDs = async (
  AVids: string[],
  progressEmitter: NoxUtils.ProgressEmitter = () => undefined,
  useBiliTag = false,
) => {
  const BVidLen = AVids.length;
  const BVidPromises = AVids.map((avid, index) =>
    fetchAVID(avid, () => progressEmitter((100 * (index + 1)) / BVidLen)),
  );
  const songs = (await Promise.all(BVidPromises)).flat();
  return useBiliTag
    ? biliShazamOnSonglist(songs, false, progressEmitter)
    : songs;
};

const regexFetch = async ({
  reExtracted,
  useBiliTag,
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: await fetchBiliAVIDs(
    [reExtracted[1]],
    undefined,
    useBiliTag || false,
  ),
});

const resolveURL = () => undefined;

export default {
  regexSearchMatch: /av(\d+)/,
  regexFetch,
  regexResolveURLMatch: /^null-/,
  resolveURL,
};
