// https://github.com/bingaha/kugou-lrc

import bfetch from '@utils/BiliFetch';
import { LrcSource } from '@enums/LyricFetch';
import { logger } from '../Logger';

const SearchSongAPI = 'https://lrclib.net/api/search?track_name=${kw}';
const getLrcAPI = 'https://lrclib.net/api/get/${kw}';

const getLrcOptions = async (
  kw: string
): Promise<NoxLyric.NoxFetchedLyric[]> => {
  logger.debug(`[lrclib] calling getLyricOptions: ${kw}`);
  const res = await bfetch(SearchSongAPI.replace('{kw}', kw));
  const json = await res.json();
  return json.map((info: any) => ({
    key: info.id,
    songMid: info.id,
    source: LrcSource.LrcLib,
    label: `[${LrcSource.LrcLib}] ${info.name}`,
    lrc: info.syncedLyrics ?? info.plainLyrics,
  }));
};

const getLyric = async (songMid: string) => {
  const res = await bfetch(getLrcAPI.replace('${kw}', songMid));
  const json = await res.json();
  return json.syncedLyrics;
};

export default {
  getLrcOptions,
  getLyric,
};
