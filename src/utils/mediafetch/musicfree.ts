import mfsdk from '@utils/mediafetch/mfsdk';

import { logger } from '../Logger';

const {
  fivesing,
  kugou,
  qq,
  kuwo,
  maoerfm,
  migu,
  netease,
  qianqian,
  xmly,
  kuiaishou,
  yinyuetai,
  youtube,
  audiomack,
} = mfsdk;

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
  kuaishou = 'kuaishou',
  yinyuetai = 'yinyuetai',
  youtube = 'mfsdkyoutube',
  audiomack = 'audiomack',
  aggregated = 'aggregated',
}

const IMusicToNoxMedia = (val: IMusic.IMusicItem, source: MUSICFREE) => {
  return {
    // HACK: so NoxMedia.Song can be shoved into getMediaSource
    ...val,
    id: `${source}-${String(val.id)}`,
    bvid: String(val.bvid ?? val.id),
    name: val.title,
    nameRaw: val.title,
    singer: val.artist,
    singerId: val.id,
    cover:
      val.artwork ||
      'https://i2.hdslb.com/bfs/face/b70f6e62e4582d4fa5d48d86047e64eb57d7504e.jpg',
    lyric: val.lrc,
    parsedName: val.title,
    source,
    duration: val.duration | 0,
  } as NoxMedia.Song;
};

const genericSearch = async (
  query: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    logger.error(`[mfsdk] ${source} failed to resolve`);
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

const kuaishouSearch = async (query: string) =>
  genericSearch(query, kuiaishou, MUSICFREE.kuaishou);

const yinyuetaiSearch = async (query: string) =>
  genericSearch(query, yinyuetai, MUSICFREE.yinyuetai);

const youtubeSearch = async (query: string) =>
  genericSearch(query, youtube, MUSICFREE.youtube);

const audiomackSearch = async (query: string) =>
  genericSearch(query, audiomack, MUSICFREE.audiomack);

const aggregatedSearcher = {
  [MUSICFREE.fivesing]: fiveSingSearch,
  [MUSICFREE.kugou]: kugouSearch,
  [MUSICFREE.qq]: qqSearch,
  [MUSICFREE.kuwo]: kuwoSearch,
  [MUSICFREE.maoerfm]: maoerfmSearch,
  [MUSICFREE.migu]: miguSearch,
  [MUSICFREE.netease]: neteaseSearch,
  [MUSICFREE.qianqian]: qianqianSearch,
  [MUSICFREE.xmly]: xmlySearch,
  [MUSICFREE.kuaishou]: kuaishouSearch,
  [MUSICFREE.yinyuetai]: yinyuetaiSearch,
  [MUSICFREE.youtube]: youtubeSearch,
  [MUSICFREE.audiomack]: audiomackSearch,
  [MUSICFREE.aggregated]: () => {
    throw new Error('Function not implemented.');
  },
};

export const searcher = {
  ...aggregatedSearcher,
  [MUSICFREE.aggregated]: async (query: string, searchWith?: MUSICFREE[]) => {
    const res = await Promise.all(
      searchWith
        ? searchWith.map(key => aggregatedSearcher[key](query))
        : Object.values(aggregatedSearcher).map(searcher => searcher(query))
    );
    return res.flat();
  },
};

type MFResolve = (
  v: IMusic.IMusicItem,
  q: string
) => Promise<{ url: string } | undefined | null>;

type Resolver = {
  [key in MUSICFREE]: (
    v: NoxMedia.Song,
    quality?: string
  ) => Promise<{ url: string } | undefined | null>;
};

const resolverWrapper = (
  v: NoxMedia.Song,
  resolver: MFResolve,
  quality = 'high'
) =>
  resolver(
    {
      ...v,
      id: v.id.substring((v.source?.length || -1) + 1),
    } as unknown as IMusic.IMusicItem,
    quality
  );

export const resolver: Resolver = {
  [MUSICFREE.fivesing]: (v: NoxMedia.Song, quality?: string) =>
    resolverWrapper(v, fivesing.getMediaSource, quality),
  [MUSICFREE.kugou]: (v: NoxMedia.Song, quality?: string) =>
    resolverWrapper(v, kugou.getMediaSource, quality),
  [MUSICFREE.qq]: (v: NoxMedia.Song, quality?: string) =>
    resolverWrapper(v, qq.getMediaSource, quality),
  [MUSICFREE.kuwo]: (v: NoxMedia.Song, quality?: string) =>
    resolverWrapper(v, kuwo.getMediaSource, quality),
  [MUSICFREE.maoerfm]: (v: NoxMedia.Song, quality?: string) =>
    resolverWrapper(v, maoerfm.getMediaSource, quality),
  [MUSICFREE.migu]: (v: NoxMedia.Song, quality?: string) =>
    resolverWrapper(v, migu.getMediaSource, quality),
  [MUSICFREE.netease]: (v: NoxMedia.Song, quality?: string) =>
    resolverWrapper(v, netease.getMediaSource, quality),
  [MUSICFREE.qianqian]: (v: NoxMedia.Song, quality?: string) =>
    resolverWrapper(v, qianqian.getMediaSource, quality),
  [MUSICFREE.xmly]: (v: NoxMedia.Song, quality?: string) =>
    resolverWrapper(v, xmly.getMediaSource, quality),
  [MUSICFREE.kuaishou]: (v: NoxMedia.Song, quality?: string) =>
    resolverWrapper(v, kuiaishou.getMediaSource, quality),
  [MUSICFREE.yinyuetai]: (v: NoxMedia.Song, quality?: string) =>
    resolverWrapper(v, yinyuetai.getMediaSource, quality),
  [MUSICFREE.youtube]: (v: NoxMedia.Song, quality?: string) =>
    resolverWrapper(v, youtube.getMediaSource, quality),
  [MUSICFREE.audiomack]: (v: NoxMedia.Song, quality?: string) =>
    resolverWrapper(v, audiomack.getMediaSource, quality),
  [MUSICFREE.aggregated]: () => {
    throw new Error('Function not implemented.');
  },
};
