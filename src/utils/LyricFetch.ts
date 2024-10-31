import i18n from 'i18next';

import logger from './Logger';
import kugouLrcFetch from './lrcfetch/kugou';
import qqLrcFetch from './lrcfetch/qq';
import qqQrcFetch from './lrcfetch/qqqrc';
import BiliLrcFetch from './lrcfetch/bili';
import LrcLibFetch from './lrcfetch/lrclib';
import { LrcSource } from '@enums/LyricFetch';

interface SearchLyricOptions {
  searchKey: string;
  source?: LrcSource;
  song?: NoxMedia.Song;
}

export const searchLyricOptions = async ({
  searchKey,
  source = LrcSource.QQ,
  song,
}: SearchLyricOptions): Promise<NoxLyric.NoxFetchedLyric[]> => {
  try {
    switch (source) {
      case LrcSource.Kugou:
        return await kugouLrcFetch.getLrcOptions(searchKey);
      case LrcSource.QQQrc:
        return await qqQrcFetch.getLrcOptions(searchKey);
      case LrcSource.BiliBili:
        return await BiliLrcFetch.getLrcOptions(song);
      case LrcSource.LrcLib:
        return await LrcLibFetch.getLrcOptions(searchKey);
      case LrcSource.QQ:
      default:
        return await qqLrcFetch.getLrcOptions(searchKey);
    }
  } catch (e) {
    logger.debug(`[lrcOptionFetch] ${searchKey} & ${source}: ${e}`);
    return [];
  }
};

export const searchLyric = async (searchMID: string, source = LrcSource.QQ) => {
  try {
    switch (source) {
      case LrcSource.Kugou:
        return await kugouLrcFetch.getLyric(searchMID);
      case LrcSource.QQQrc:
        return await qqQrcFetch.getLyric(searchMID);
      case LrcSource.BiliBili:
        return await BiliLrcFetch.getLyric(searchMID);
      case LrcSource.QQ:
      default:
        return await qqLrcFetch.getLyric(searchMID);
    }
  } catch (e) {
    logger.warn(`[lrcFetch] ${searchMID} & ${source}: ${e}`);
    return i18n.t('Lyric.failedToFetch');
  }
};
