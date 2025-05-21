import md5 from 'md5';
import Aes from 'react-native-aes-crypto';

import bfetch from '@utils/BiliFetch';
// https://github.com/lyswhut/lx-music-desktop/blob/c1e7faa7bf8daeaf3ef4090c30a552931edd6150/src/renderer/utils/musicSdk/wy/lyric.js#L38

const Buffer = require('buffer/').Buffer;
const LyricAPI = 'api/song/lyric/v1';
const eapiKey = 'e82ckenh8dichen8';

const eapi = (url: string, body: string) => {
  const message = `nobody${url}use${body}md5forencrypt`;
  const digest = md5(message);
  const data = `${url}-36cd479b6b5-${body}-36cd479b6b5-${digest}`;
  Aes.encrypt(data, 'aes-128-ecb', eapiKey, '');
  return {
    params: aesEncrypt(Buffer.from(data), 'aes-128-ecb', eapiKey, '')
      .toString('hex')
      .toUpperCase(),
  };
};

export const getLyric = async (songmid: string) => {
  // https://github.com/lyswhut/lx-music-desktop/blob/c1e7faa7bf8daeaf3ef4090c30a552931edd6150/src/renderer/utils/musicSdk/wy/lyric.js#L266
  const payload = {
    id: songmid,
    cp: false,
    tv: 0,
    lv: 0,
    rv: 0,
    kv: 0,
    yv: 0,
    ytv: 0,
    yrv: 0,
  };
  const res = await bfetch(`https://interface3.music.163.com/e${LyricAPI}`, {
    method: 'post',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
      origin: 'https://music.163.com',
    },
    body: eapi(LyricAPI, JSON.stringify(payload)),
  });
};
