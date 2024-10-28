import { biliApiLimiter } from './throttle';

import {
  resolveURL as resolveURLYtbi,
  fetchAudioInfo as fetchAudioInfoYtbi,
  suggest as suggestYtbi,
} from './ytbvideo.ytbi';
import {
  resolveURL as resolveURLMuse,
  fetchAudioInfo as fetchAudioInfoMuse,
} from './ytbvideo.muse';

const resolveURL = (song: NoxMedia.Song, iOS = false) =>
  iOS
    ? resolveURLYtbi(song, iOS).catch(() => resolveURLMuse(song))
    : resolveURLMuse(song).catch(() => resolveURLYtbi(song, iOS));

export const fetchAudioInfo = (bvid: string, progressEmitter?: () => void) =>
  biliApiLimiter.schedule(() => {
    progressEmitter?.();
    return fetchAudioInfoYtbi(bvid).catch(() => fetchAudioInfoMuse(bvid));
  });

const regexFetch = async ({
  reExtracted,
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => {
  const audioInfo = await fetchAudioInfo(reExtracted[1]);
  return { songList: audioInfo ?? [] };
};

const refreshSong = (song: NoxMedia.Song) => song;

const export2URL = (song: NoxMedia.Song) =>
  `https://www.youtube.com/watch?v=${song.bvid}`;

export default {
  regexSearchMatch: /youtu(?:.*\/v\/|.*v=|\.be\/)([A-Za-z0-9_-]{11})/,
  regexFetch,
  regexResolveURLMatch: /^youtube-/,
  regexResolveURLMatch2: /^ytbvideo-/,
  resolveURL,
  refreshSong,
  suggest: suggestYtbi,
  export2URL,
};
