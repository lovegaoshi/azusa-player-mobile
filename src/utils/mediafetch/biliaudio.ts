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

import SongTS from '@objects/Song';
import { logger } from '../Logger';
import bfetch from '@utils/BiliFetch';
import { biliApiLimiter } from './throttle';

const URL_AUDIO_INFO =
  'https://www.bilibili.com/audio/music-service-c/web/song/info?sid={sid}';
const URL_AUDIO_PLAY_URL =
  'https://www.bilibili.com/audio/music-service-c/web/url?sid={sid}';
const CIDPREFIX = `${NoxEnumMediaFetch.Source.Biliaudio}-`;

const fetchPlayUrlPromise = async (sid: string) => {
  try {
    logger.debug(
      `fethcAudioPlayURL:${URL_AUDIO_PLAY_URL.replace('{sid}', sid)}`
    );
    const res = await bfetch(URL_AUDIO_PLAY_URL.replace('{sid}', sid));
    const json = await res.json();
    return json.data.cdns[0] as string;
  } catch (e) {
    logger.error(e);
    throw e;
  }
};

export const baFetch = async (auids: string[]) => {
  logger.info('calling fetcAudioInfo');

  return Promise.all(
    auids.map(sid =>
      biliApiLimiter.schedule(async () => {
        const res = await bfetch(URL_AUDIO_INFO.replace('{sid}', sid));
        const json = await res.json();
        const { data } = json;
        return SongTS({
          cid: `${CIDPREFIX}-${sid}`,
          bvid: sid,
          name: data.title,
          nameRaw: data.title,
          singer: data.uname,
          singerId: data.uid,
          cover: data.cover,
          lyric: '',
          page: 1,
          duration: data.duration,
          album: data.title,
          source: NoxEnumMediaFetch.Source.Biliaudio,
        });
      })
    )
  );
};

const regexFetch = async ({
  reExtracted,
}: regexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: await baFetch([reExtracted[1]!]),
});

const resolveURL = async (song: NoxMedia.Song) => {
  return { url: await fetchPlayUrlPromise(song.bvid) };
};

const refreshSong = (song: NoxMedia.Song) => song;

const export2URL = (song: NoxMedia.Song) =>
  `https://www.bilibili.com/audio/au${song.bvid}`;

export default {
  regexSearchMatch: /bilibili.com\/audio\/au([^/?]+)/,
  regexFetch,
  regexResolveURLMatch: /^biliaudio-/,
  resolveURL,
  refreshSong,
  export2URL,
};
