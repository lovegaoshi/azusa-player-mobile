import { wbiQuery } from '@stores/wbi';
import bfetch from '@utils/BiliFetch';
import { LrcSource } from '@enums/LyricFetch';
import logger from '../Logger';
import { cookieHeader } from '@utils/Bilibili/biliCookies';
import { seconds2MMSS } from '@utils/Utils';
import { Source } from '@enums/MediaFetch';

const API = 'https://api.bilibili.com/x/player/wbi/v2?bvid={bvid}&cid={cid}';

const getBiliLyricOptions = async (
  song?: NoxMedia.Song
): Promise<NoxNetwork.NoxFetchedLyric[]> => {
  if (song?.source !== Source.bilivideo) return [];
  const res = await wbiQuery(
    API.replace('{bvid}', song.bvid).replace('{cid}', song.id),
    await cookieHeader()
  );
  const json = await res.json();
  return json.data.subtitle.subtitles.map((subtitle: any) => ({
    key: subtitle.subtitle_url,
    songMid: subtitle.subtitle_url,
    source: LrcSource.BiliBili,
    label: `[${LrcSource.BiliBili}] ${subtitle.lan_doc} ${subtitle.id}`,
  }));
};

const getBiliLyric = async (songMid: string) => {
  logger.debug(`[Lrc] calling getBiliLyric: ${songMid}`);
  const res = await bfetch(`https:${songMid}`);
  const json = await res.json();
  return biliSub2Lrc(json.body);
};

export default {
  getLrcOptions: getBiliLyricOptions,
  getLyric: getBiliLyric,
};
interface BiliSubEntry {
  from: number;
  to: number;
  content: string;
}

export const biliSub2Lrc = (lrc: BiliSubEntry[]) =>
  lrc.reduce((arr, curr) => {
    return `${arr}[${seconds2MMSS(curr.from)}.00]${curr.content}\n`;
  }, '');
