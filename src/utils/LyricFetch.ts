import kugouLrcFetch from './lrcfetch/kugou';
import qqLrcFetch from './lrcfetch/qq';
import { LrcSource } from '@enums/LyricFetch';

export const searchLyricOptions = async (
  searchKey: string,
  source = LrcSource.QQ
): Promise<NoxNetwork.NoxFetchedLyric[]> => {
  switch (source) {
    case LrcSource.Kugou:
      return kugouLrcFetch.getLrcOptions(searchKey);
    case LrcSource.QQ:
    default:
      return qqLrcFetch.getLrcOptions(searchKey);
  }
};

export const searchLyric = async (searchMID: string, source = LrcSource.QQ) => {
  switch (source) {
    case LrcSource.Kugou:
      return kugouLrcFetch.getLyric(searchMID);
    case LrcSource.QQ:
    default:
      return qqLrcFetch.getLyric(searchMID);
  }
};
