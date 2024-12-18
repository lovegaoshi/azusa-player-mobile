import CryptoJs from 'crypto-js';
import dayjs from 'dayjs';
import axios from 'axios';
import bigInt from 'big-integer';
import qs from 'qs';
import * as cheerio from 'cheerio';
import CookieManager from '@react-native-cookies/cookies';
import he from 'he';
import { URL } from 'react-native-url-polyfill';

const Qualities = ['super', 'high', 'standard', 'low'];

interface MFsdk {
  platform: string;
  version: string;
  author: string;
  srcUrl: string;
  supportedSearchType: string[];
  regexFetch: (
    v: NoxNetwork.BiliSearchFetchProps,
  ) => Promise<NoxNetwork.NoxRegexFetch>;
  resolveURL: (v: NoxMedia.Song) => Promise<NoxNetwork.ParsedNoxMediaURL>;
  /*
  search: [AsyncFunction: search],
  getMediaSource: [AsyncFunction: getMediaSource];
  ---------------
  not implemented and doesnt fit APM's purposes
  getAlbumInfo: [AsyncFunction: getAlbumInfo];
  getMusicSheetInfo: [AsyncFunction: getMusicSheetInfo];
  getArtistWorks: [AsyncFunction: getArtistWorks];
  getRecommendSheetTags: [AsyncFunction: getRecommendSheetTags];
  getRecommendSheetsByTag: [AsyncFunction: getRecommendSheetsByTag];
  getTopLists: [AsyncFunction: getTopLists];
  getTopListDetail: [AsyncFunction: getTopListDetail];
  */
}

const IMusicToNoxMedia = (val: IMusic.IMusicItem, source: string) => {
  return {
    // HACK: so NoxMedia.Song can be shoved into getMediaSource
    ...val,
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

const searchWrapper =
  (search: (s: string, p: number, t: string) => any, sdk: MFsdk) =>
  async (
    v: NoxNetwork.BiliSearchFetchProps,
  ): Promise<NoxNetwork.NoxRegexFetch> => {
    const results = await search(v.url, 1, 'music');
    const songList = results.data.map((iMusic: any) =>
      IMusicToNoxMedia(iMusic, sdk.platform),
    );
    return { songList };
  };

const resolveURLWrapper =
  (
    resolveURL: (v: any, quality: string) => Promise<{ url: string }>,
    sdk: MFsdk,
  ) =>
  async (v: NoxMedia.Song, qualities = Qualities) => {
    for (const quality of qualities) {
      const res = await resolveURL(v, quality);
      if (res) {
        return res;
      }
    }
    throw Error(
      `[resolveURL] mfsdk ${sdk.platform} v${sdk.version} failed to resolve.`,
    );
  };

axios.defaults.timeout = 2000;

const packages: Record<string, any> = {
  cheerio,
  'crypto-js': CryptoJs,
  axios,
  dayjs,
  'big-integer': bigInt,
  qs,
  he,
  '@react-native-cookies/cookies': CookieManager,
};

const _require = (packageName: string) => {
  const pkg = packages[packageName];
  pkg.default = pkg;
  return pkg;
};

const _consoleBind = function (
  method: 'log' | 'error' | 'info' | 'warn',
  ...args: any
) {
  const fn = console[method];
  if (fn) {
    fn(...args);
  }
};

const _console = {
  log: _consoleBind.bind(null, 'log'),
  warn: _consoleBind.bind(null, 'warn'),
  info: _consoleBind.bind(null, 'info'),
  error: _consoleBind.bind(null, 'error'),
};

export const loadEvalPlugin = (plugin: string): MFsdk => {
  const env = {
    getUserVariables: () => ({}),
    os: 'android',
  };

  const _module: any = { exports: {} };
  let _instance: any;
  // eslint-disable-next-line no-new-func
  _instance = Function(`
                    'use strict';
                    return function(require, __musicfree_require, module, exports, console, env, URL) {
                        ${plugin}
                    }
                `)()(
    _require,
    _require,
    _module,
    _module.exports,
    _console,
    env,
    URL,
  );
  if (_module.exports.default) {
    _instance = _module.exports.default;
  } else {
    _instance = _module.exports;
  }
  return {
    ..._instance,
    regexFetch: searchWrapper(_instance.search, _instance),
    resolveURL: resolveURLWrapper(_instance.getMediaSource, _instance),
  };
};
