import i18n from "i18next";

import logger from "./Logger";
import kugouLrcFetch from "./lrcfetch/kugou";
import qqLrcFetch from "./lrcfetch/qq";
import qqQrcFetch from "./lrcfetch/qqqrc";
import BiliLrcFetch from "./lrcfetch/bili";
import { LrcSource } from "@enums/LyricFetch";

interface SearchLyricOptions {
  searchKey: string;
  source?: LrcSource;
  song?: NoxMedia.Song;
}

export const searchLyricOptions = async ({
  searchKey,
  source = LrcSource.QQ,
  song,
}: SearchLyricOptions): Promise<NoxNetwork.NoxFetchedLyric[]> => {
  try {
    switch (source) {
      case LrcSource.Kugou:
        return await kugouLrcFetch.getLrcOptions(searchKey);
      case LrcSource.QQQrc:
        return await qqQrcFetch.getLrcOptions(searchKey);
      case LrcSource.BiliBili:
        return await BiliLrcFetch.getLrcOptions(song);
      case LrcSource.QQ:
      default:
        return await qqLrcFetch.getLrcOptions(searchKey);
    }
  } catch (e) {
    logger.warn(`[lrcOptionFetch] ${searchKey} & ${source}: ${e}`);
    return [];
  }
};

export const searchLyric = async (searchMID: string, source = LrcSource.QQ) => {
  try {
    switch (source) {
      case LrcSource.Kugou:
        return kugouLrcFetch.getLyric(searchMID);
      case LrcSource.QQQrc:
        return qqQrcFetch.getLyric(searchMID);
      case LrcSource.BiliBili:
        return BiliLrcFetch.getLyric(searchMID);
      case LrcSource.QQ:
      default:
        return qqLrcFetch.getLyric(searchMID);
    }
  } catch (e) {
    logger.warn(`[lrcFetch] ${searchMID} & ${source}: ${e}`);
    return i18n.t("Lyric.failedToFetch");
  }
};
