// https://github.com/bingaha/kugou-lrc
import { strFromU8, decompressSync } from 'fflate';
import { decode as atob } from 'base-64';

import bfetch from '@utils/BiliFetch';
import { LrcSource } from '@enums/LyricFetch';
import { logger } from '../Logger';

const SearchSongAPI =
  'https://mobileservice.kugou.com/api/v3/lyric/search?version=9108&highlight=1&keyword={kw}&plat=0&pagesize=20&area_code=1&page=1&with_res_tag=1';
const AccessKeyAPI =
  'https://krcs.kugou.com/search?ver=1&man=yes&client=mobi&keyword=&duration=&hash={hash}&album_audio_id=';
const LyricAPI =
  'https://lyrics.kugou.com/download?ver=1&client=pc&id={id}&accesskey={accessKey}&fmt=krc&charset=utf8';
const KugouCommentBlock = /<!--[^-]+-->/g;

const kugouDecrypt = (content: string) => {
  // https://blog.csdn.net/weixin_42146086/article/details/117543439
  const encrypt_key = [
    64, 71, 97, 119, 94, 50, 116, 71, 81, 54, 49, 45, 206, 210, 110, 105,
  ];
  const slicedContent = content.slice(4);
  const decryptedContent = Uint8Array.from(
    slicedContent,
    (c, i) => c.charCodeAt(0) ^ encrypt_key[i % encrypt_key.length]
  );
  return strFromU8(decompressSync(decryptedContent));
};

const getKugouLyricOptions = async (
  kw: string
): Promise<NoxNetwork.NoxFetchedLyric[]> => {
  logger.debug(`[kugou] calling getKugouLyricOptions: ${kw}`);
  const res = await bfetch(SearchSongAPI.replace('{kw}', kw));
  const bodytxt = await res.text();
  const json = JSON.parse(bodytxt.replaceAll(KugouCommentBlock, ''));
  return json.data.info.map((info: any) => ({
    key: info.hash,
    songMid: info.hash,
    source: LrcSource.Kugou,
    label: `[${LrcSource.Kugou}] ${info.filename}`,
  }));
};

const getKugouLyric = async (songMid: string) => {
  logger.debug(`[kugou] calling getKugouLyric: ${songMid}`);
  const res = await bfetch(AccessKeyAPI.replace('{hash}', songMid));
  const json = await res.json();
  const { accesskey, id } = json.candidates[0];
  const res2 = await bfetch(
    LyricAPI.replace('{id}', id).replace('{accessKey}', accesskey)
  );
  const { content } = await res2.json();
  return kugouDecrypt(atob(content));
};

export default {
  getLrcOptions: getKugouLyricOptions,
  getLyric: getKugouLyric,
};
