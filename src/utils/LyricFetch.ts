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

export const searchLyric = async (
  searchMID: string,
  setLyric: (v: string) => void,
  source = LrcSource.QQ
) => {
  let lrc = '';
  switch (source) {
    case LrcSource.Kugou:
      lrc = await kugouLrcFetch.getLyric(searchMID);
    case LrcSource.QQ:
    default:
      lrc = await qqLrcFetch.getLyric(searchMID);
  }
  setLyric(lrc);
  return lrc;
};
