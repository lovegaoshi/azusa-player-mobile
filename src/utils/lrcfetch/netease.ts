import i18n from 'i18next';
import he from 'he';
import { createStore } from 'zustand/vanilla';

import bfetch from '@utils/BiliFetch';
import { LrcSource } from '@enums/LyricFetch';
import { logger } from '../Logger';
import { getLyric } from './neteaseEapi';

// 绑定手机后，可进行下一步操作哦
interface Store {
  cookie?: string;
}

const store = createStore<Store>(() => ({}));

const SEARCH_API =
  'https://music.163.com/api/search/pc?type=1&s={kw}&limit=20&offset=0';

const LRC_API =
  'https://music.163.com/api/song/lyric?os=osx&id={id}&lv=-1&kv=-1&tv=-1';

/**
 * https://github.com/mos9527/pyncm/blob/6f2a77e762a3ff32c06d795612edf77b9c422af0/pyncm/apis/__init__.py#L150
 * eapi: https://github.com/mos9527/pyncm/pull/38/files
 */

export const getCookie = async () => {
  let { cookie } = store.getState();
  if (!cookie) {
    const res = await bfetch(SEARCH_API);
    const cookieString = res.headers.get('set-cookie');
    cookie = cookieString?.split(';')[0];
    store.setState({ cookie });
  }
  return cookie;
};

const getLrcOptions = async (
  kw: string,
): Promise<NoxLyric.NoxFetchedLyric[]> => {
  logger.debug(`[netease] calling getNeteaseLyricOptions: ${kw}`);
  const res = await bfetch(SEARCH_API.replace('{kw}', kw), {
    headers: {
      method: 'GET',
      cookie: (await getCookie()) ?? '',
    },
  });
  const json = await res.json();
  return (
    json?.result?.songs?.map((info: any) => ({
      key: info.id,
      songMid: info.id,
      source: LrcSource.Netease,
      label: `[${LrcSource.Netease}] ${info.name} - ${info.artists[0]?.name}`,
    })) ?? []
  );
};

export const getLyricOld = async (songMid: string) => {
  logger.debug(`[netease] calling getNeteaseLyric: ${songMid}`);
  const res = await bfetch(LRC_API.replace('{id}', songMid));
  const json = await res.json();
  if (!json?.lrc?.lyric) {
    return i18n.t('Lyric.notFound');
  }

  let finalLrc = json.lrc.lyric as string;

  // Merge trans Lyrics
  if (json?.tlyric?.lyric) {
    finalLrc = `${json?.tlyric?.lyric}\n${finalLrc}`;
  }
  finalLrc = he.decode(finalLrc);
  // logger.log(finalLrc)
  return finalLrc;
};

export default {
  getLrcOptions,
  getLyric,
};
