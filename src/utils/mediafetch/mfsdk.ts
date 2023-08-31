/* eslint-disable import/no-unresolved */
import * as fivesing from '@mfsdk/5sing/index';
import * as kugou from '@mfsdk/kugou/index';
import * as qq from '@mfsdk/qq/index';
import * as kuwo from '@mfsdk/kuwo/index';
import * as maoerfm from '@mfsdk/maoerfm/index';
import * as migu from '@mfsdk/migu/index';
import * as netease from '@mfsdk/netease/index';
import * as qianqian from '@mfsdk/qianqian/index';
import * as xmly from '@mfsdk/xmly/index';

import logger from '../Logger';

// This is exactly why users should NOT inject whatever scripts
// into your app.

export enum MUSICFREE {
  fivesing = 'fivesing',
  kugou = 'kugou',
  qq = 'qq',
  kuwo = 'kuwo',
  maoerfm = 'maoerfm',
  migu = 'migu',
  netease = 'netease',
  qianqian = 'qianqian',
  xmly = 'xmly',
  aggregated = 'aggregated',
}

const IMusicToNoxMedia = (val: IMusic.IMusicItem, source: MUSICFREE) => {
  return {
    // HACK: so NoxMedia.Song can be shoved into getMediaSource
    ...val,
    id: String(val.id),
    bvid: val.bvid || val.id,
    name: val.title,
    nameRaw: val.title,
    singer: val.artist,
    singerId: val.id,
    cover: val.artwork || '',
    lyric: val.lrc,
    parsedName: val.title,
    source,
  } as NoxMedia.Song;
};

const genericSearch = async (
  query: string,
  module: any,
  source: MUSICFREE
): Promise<NoxMedia.Song[]> => {
  try {
    const res = await module.search(query, 1, 'music');
    if (!res) return [];
    return res.data.map((val: IMusic.IMusicItem) =>
      IMusicToNoxMedia(val, source)
    );
  } catch (e) {
    logger.error(e);
  }
  return [];
};
const fiveSingSearch = async (query: string) =>
  genericSearch(query, fivesing, MUSICFREE.fivesing);

const kugouSearch = async (query: string) =>
  genericSearch(query, kugou, MUSICFREE.kugou);

const qqSearch = async (query: string) =>
  genericSearch(query, qq, MUSICFREE.qq);

const kuwoSearch = async (query: string) =>
  genericSearch(query, kuwo, MUSICFREE.kuwo);

const maoerfmSearch = async (query: string) =>
  genericSearch(query, maoerfm, MUSICFREE.maoerfm);

const miguSearch = async (query: string) =>
  genericSearch(query, migu, MUSICFREE.migu);

const neteaseSearch = async (query: string) =>
  genericSearch(query, netease, MUSICFREE.netease);

const qianqianSearch = async (query: string) =>
  genericSearch(query, qianqian, MUSICFREE.qianqian);

const xmlySearch = async (query: string) =>
  genericSearch(query, xmly, MUSICFREE.xmly);

export const searcher = {
  [MUSICFREE.fivesing]: fiveSingSearch,
  [MUSICFREE.kugou]: kugouSearch,
  [MUSICFREE.qq]: qqSearch,
  [MUSICFREE.kuwo]: kuwoSearch,
  [MUSICFREE.maoerfm]: maoerfmSearch,
  [MUSICFREE.migu]: miguSearch,
  [MUSICFREE.netease]: neteaseSearch,
  [MUSICFREE.qianqian]: qianqianSearch,
  [MUSICFREE.xmly]: xmlySearch,
  [MUSICFREE.aggregated]: async (query: string) => {
    const res = await Promise.all([
      fiveSingSearch(query),
      kugouSearch(query),
      qqSearch(query),
      kuwoSearch(query),
      maoerfmSearch(query),
      miguSearch(query),
      neteaseSearch(query),
      qianqianSearch(query),
      xmlySearch(query),
    ]);
    return res.flat();
  },
};

type Resolver = {
  [key in MUSICFREE]: (
    v: IMusic.IMusicItem,
    q: string
  ) => Promise<{ url: string } | undefined | null>;
};

export const resolver: Resolver = {
  [MUSICFREE.fivesing]: fivesing.getMediaSource,
  [MUSICFREE.kugou]: kugou.getMediaSource,
  [MUSICFREE.qq]: qq.getMediaSource,
  [MUSICFREE.kuwo]: kuwo.getMediaSource,
  [MUSICFREE.maoerfm]: maoerfm.getMediaSource,
  [MUSICFREE.migu]: migu.getMediaSource,
  [MUSICFREE.netease]: netease.getMediaSource,
  [MUSICFREE.qianqian]: qianqian.getMediaSource,
  [MUSICFREE.xmly]: xmly.getMediaSource,
  [MUSICFREE.aggregated]: () => {
    throw new Error('Function not implemented.');
  },
};
