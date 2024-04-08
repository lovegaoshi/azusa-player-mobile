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

const API = 'https://api.bilibili.com/pgc/view/web/season?ep_id={ep}';
const API_PLAY =
  'https://api.bilibili.com/pgc/player/web/playurl?cid={cid}&ep_id={ep}';
const CIDPREFIX = `${NoxEnumMediaFetch.Source.BiliBangumi}-`;

const fetchPlayUrlPromise = async (cid: string, epid: string) => {
  try {
    const newAPI = API_PLAY.replace('{cid}', cid).replace('{ep}', epid);
    logger.debug(`fethcBangumiPlayURL: ${newAPI}`);
    const res = await bfetch(newAPI);
    const json = await res.json();
    return json.result.durl[0].url as string;
  } catch (e) {
    logger.error(e);
    throw e;
  }
};

const regexFetch = async ({
  reExtracted,
}: regexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => {
  const epid = reExtracted[1]!;
  const newAPI = API.replace('{ep}', epid);
  logger.debug(`fetchBangumiInfo: ${newAPI}`);
  const res = await bfetch(newAPI);
  const json = await res.json();
  return {
    songList: json.result.episodes.map((ep: any) =>
      SongTS({
        cid: `${CIDPREFIX}${ep.cid}`,
        bvid: ep.ep_id,
        name: ep.long_title,
        nameRaw: ep.long_title,
        singer: json.result.season_title,
        singerId: json.result.season_id,
        cover: json.result.cover,
        lyric: '',
        page: 1,
        duration: ep.duration,
        album: ep.share_copy,
        source: NoxEnumMediaFetch.Source.BiliBangumi,
      })
    ),
  };
};

const resolveURL = async (song: NoxMedia.Song) => {
  return { url: await fetchPlayUrlPromise(song.id.slice(12), song.bvid) };
};

const refreshSong = (song: NoxMedia.Song) => song;

const export2URL = (song: NoxMedia.Song) =>
  `https://www.bilibili.com/bangumi/play/ep${song.bvid}`;

export default {
  regexSearchMatch: /bilibili.com\/bangumi\/play\/ep(\d+)/,
  regexFetch,
  regexResolveURLMatch: /^biliBangumi-/,
  resolveURL,
  refreshSong,
  export2URL,
};
