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

import VideoInfo from '@objects/VideoInfo';
import SongTS from '@objects/Song';
import { logger } from '../Logger';
import bfetch from '@utils/BiliFetch';
import { SOURCE } from '@enums/MediaFetch';
import { filterUndefined } from '../Utils';

const URL_AUDIO_INFO =
  'https://www.bilibili.com/audio/music-service-c/web/song/info?sid={sid}';
const URL_AUDIO_PLAY_URL =
  'https://www.bilibili.com/audio/music-service-c/web/url?sid={sid}';
const CIDPREFIX = `${SOURCE.biliaudio}-`;

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

export const fetchAudioInfoRaw = async (sid: string) => {
  logger.info('calling fetcAudioInfo');
  const res = await bfetch(URL_AUDIO_INFO.replace('{sid}', sid));
  const json = await res.json();
  try {
    const { data } = json;
    const v = new VideoInfo(
      data.title,
      data.intro,
      1,
      data.cover,
      { name: data.uname, mid: data.uid, face: data.uid },
      [{ cid: CIDPREFIX, bvid: sid, part: '1', duration: data.duration }],
      sid,
      data.duration
    );
    return v;
  } catch (error) {
    logger.error(error);
    logger.warn(`Some issue happened when fetching biliAudio ${sid}`);
  }
};

export const fetchAudioInfo = async (
  bvid: string,
  progressEmitter: () => void = () => undefined
) =>
  await biliApiLimiter.schedule(() => {
    progressEmitter();
    return fetchAudioInfoRaw(bvid);
  });

export const songFetch = ({ videoinfos }: { videoinfos: VideoInfo[] }) => {
  const aggregateVideoInfo = (info: VideoInfo) =>
    info.pages.map(() => {
      return SongTS({
        cid: `${CIDPREFIX}-${info.bvid}`,
        bvid: info.bvid,
        name: info.title,
        nameRaw: info.title,
        singer: info.uploader.name,
        singerId: info.uploader.mid,
        cover: info.picSrc,
        lyric: '',
        page: 1,
        duration: info.duration,
        album: info.title,
        source: SOURCE.biliaudio,
      });
    });
  const songs = videoinfos.reduce(
    (acc, curr) => acc.concat(aggregateVideoInfo(curr)),
    [] as NoxMedia.Song[]
  );
  return songs;
};

export const baFetch = async (auids: string[]) => {
  const audioInfo = filterUndefined(
    await Promise.all(auids.map(auid => fetchAudioInfo(auid))),
    v => v
  );
  return songFetch({
    videoinfos: audioInfo,
  });
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
