import he from 'he';
import i18n from 'i18next';

import bfetch from '@utils/BiliFetch';
import { logger } from '../Logger';
import { LrcSource } from '@enums/LyricFetch';

/**
 *  QQ LyricSearchAPI
 */

const URL_QQ_LYRIC =
  'https://i.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?songmid={SongMid}&g_tk=5381&format=json&inCharset=utf8&outCharset=utf-8&nobase64=1';

const URL_QQ_SEARCH_POST = () => ({
  src: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
  params: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    referrer: 'https://u.qq.com/',
    body: {
      comm: {
        ct: '19',
        cv: '1859',
        uin: '0',
      },
      req: {
        method: 'DoSearchForQQMusicDesktop',
        module: 'music.search.SearchCgiService',
        param: {
          grp: 1,
          num_per_page: 10,
          page_num: 1,
          query: '',
          search_type: 0,
        },
      },
    },
  },
});

export const searchLyricOptions = async (
  searchKey: string
): Promise<NoxNetwork.NoxFetchedLyric[]> => {
  if (!searchKey) {
    throw new Error('Search key is required');
  }
  logger.debug(`[qqlyric] calling searchLyricOptions: ${searchKey}`);
  const API = getQQSearchAPI(searchKey);
  const res = await bfetch(API.src, API.params);
  const json = await res.json();
  const data = json.req.data.body.song.list;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((s: any) => ({
    key: s.mid,
    songMid: s.mid,
    label: `[${LrcSource.QQ}] ${s.name} / ${s.singer[0].name}`,
    source: LrcSource.QQ,
  }));
};

const getQQSearchAPI = (searchKey: string) => {
  const API = URL_QQ_SEARCH_POST();
  API.params.body.req.param.query = searchKey;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  API.params.body = JSON.stringify(API.params.body);
  return API;
};

export const searchLyric = async (searchMID: string) => {
  logger.debug(`[qqlyric] calling searchLyric: ${searchMID}`);
  const res = await bfetch(URL_QQ_LYRIC.replace('{SongMid}', searchMID));
  const json = await res.json();
  if (!json.lyric) {
    return i18n.t('Lyric.notFound');
  }

  let finalLrc = json.lyric as string;

  // Merge trans Lyrics
  if (json.trans) {
    finalLrc = `${json.trans}\n${finalLrc}`;
  }
  finalLrc = he.decode(finalLrc);
  // logger.log(finalLrc)
  return finalLrc;
};

export default {
  getLrcOptions: searchLyricOptions,
  getLyric: searchLyric,
};
