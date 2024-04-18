// https://github.com/bingaha/kugou-lrc
import { decode as atob, encode as btoa } from 'base-64';

import bfetch from '@utils/BiliFetch';
import { biliApiLimiter } from '@utils/mediafetch/throttle';
import { LrcSource } from '@enums/LyricFetch';
import { logger } from '../Logger';
import { decodeQrc } from './qrcdecoder';

const SearchSongAPI = 'https://u.y.qq.com/cgi-bin/musicu.fcg';

const searchPost = (kw: string): any => {
  const body = {
    comm: {
      _channelid: '0',
      _os_version: '6.2.9200-2',
      authst: '',
      ct: '19',
      cv: '1873',
      patch: '118',
      psrf_access_token_expiresAt: 0,
      psrf_qqaccess_token: '',
      psrf_qqopenid: '',
      psrf_qqunionid: '',
      tmeAppID: 'qqmusic',
      tmeLoginType: 2,
      uin: '0',
      wid: '0',
    },
    'music.musichallSong.PlayLyricInfo.GetPlayLyricInfo': {
      method: 'GetPlayLyricInfo',
      module: 'music.musichallSong.PlayLyricInfo',
      param: {
        songName: btoa(kw),
        crypt: 1,
        qrc: 1,
        ct: 19,
        cv: 1873,
        lrc_t: 0,
        qrc_t: 0,
        roma: 1,
        roma_t: 0,
        type: -1,
        trans: 1,
        trans_t: 0,
      },
    },
  };
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Host: 'u.y.qq.com',
    },
    referrer: 'https://u.qq.com/',
    body: JSON.stringify(body),
  };
};

const getQrcLyricOptions = async (
  kw: string
): Promise<NoxNetwork.NoxFetchedLyric[]> => {
  logger.debug(`[qrc] calling getQrcLyricOptions: ${kw}`);
  const res = await bfetch(SearchSongAPI, searchPost(kw));
  const json = await res.json();
  const data = json['music.musichallSong.PlayLyricInfo.GetPlayLyricInfo']?.data;
  if (data.lyric.length > 0) {
    return [
      {
        key: data.songID,
        songMid: data.songID,
        source: LrcSource.QQQrc,
        label: `[${LrcSource.QQQrc}] ${kw}`,
        // HACK: this should be safe as the search param specifies
        // encrypt:1 and qrc:1
        lrc: decodeQrc(data.lyric),
      },
    ];
  }
  return [];
  // HACK: temporarily disable this because it has encoding problems
  return json[
    'music.musichallSong.PlayLyricInfo.GetPlayLyricInfo'
  ].data.vecSongID.map((info: any) => ({
    key: info,
    songMid: info,
    source: LrcSource.QQQrc,
    label: `[${LrcSource.QQQrc}] ${kw}(${info})`,
  }));
};

const getQrcLyric = async (songMid: string) => {
  logger.debug(`[qrc] calling getQrcLyric: ${songMid}`);
  const qrcPostParam = searchPost('');
  const parsedBody = JSON.parse(qrcPostParam.body);
  parsedBody['music.musichallSong.PlayLyricInfo.GetPlayLyricInfo'].param = {
    songID: Number(songMid),
  };
  qrcPostParam.body = JSON.stringify(parsedBody);
  const res = await bfetch(SearchSongAPI, qrcPostParam);
  const json = await res.json();
  const data = json['music.musichallSong.PlayLyricInfo.GetPlayLyricInfo'].data;
  if (data.qrc == 0) return atob(data.lyric);
  return decodeQrc(data.lyric);
};

export default {
  getLrcOptions: getQrcLyricOptions,
  getLyric: getQrcLyric,
};
