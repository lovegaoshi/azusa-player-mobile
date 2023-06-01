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

import VideoInfo from '../../objects/VideoInfo';
import SongTS from '../../objects/Song';
import { logger } from '../Logger';
import bfetch from '../BiliFetch';

const URL_AUDIO_INFO =
  'https://www.bilibili.com/audio/music-service-c/web/song/info?sid={sid}';
const URL_AUDIO_PLAY_URL =
  'https://www.bilibili.com/audio/music-service-c/web/url?sid={sid}';
const CIDPREFIX = 'biliaudio-';

const fetchAudioPlayUrlPromise = async (sid: string) => {
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

export const songFetch = async ({
  videoinfos,
  useBiliTag,
}: {
  videoinfos: VideoInfo[];
  useBiliTag: boolean;
}) => {
  const aggregateVideoInfo = (info: VideoInfo) =>
    info.pages.map((page: any, index: number) => {
      const filename = info.pages.length === 1 ? info.title : page.part;
      return SongTS({
        cid: `${info.pages[0].cid}-${info.bvid}`,
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
      });
    });
  const songs = videoinfos.reduce(
    (acc, curr) => acc.concat(aggregateVideoInfo(curr)),
    [] as NoxMedia.Song[]
  );
  return songs;
};

const regexFetch = async ({ reExtracted, useBiliTag }: regexFetchProps) => {
  const audioInfo = await fetchAudioInfo(reExtracted[1]!);
  if (!audioInfo) return [];
  return songFetch({
    videoinfos: [audioInfo], // await fetchiliBVID([reExtracted[1]!])
    useBiliTag: useBiliTag || false,
  });
};

const resolveURL = (song: NoxMedia.Song) => fetchAudioPlayUrlPromise(song.bvid);

const refreshSong = (song: NoxMedia.Song) => song;

export default {
  regexSearchMatch: /bilibili.com\/audio\/au([^/?]+)/,
  regexFetch,
  regexResolveURLMatch: /^biliaudio-/,
  resolveURL,
  refreshSong,
};
