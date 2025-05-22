import md5 from 'md5';
// @ts-expect-error
import Aes from 'react-native-aes-ecb';

import bfetch from '@utils/BiliFetch';
// https://github.com/lyswhut/lx-music-desktop/blob/c1e7faa7bf8daeaf3ef4090c30a552931edd6150/src/renderer/utils/musicSdk/wy/lyric.js#L38

const Buffer = require('buffer/').Buffer;
const LyricAPI = 'api/song/lyric/v1';
const eapiKey = 'e82ckenh8dichen8';

const eapi = (url: string, body: string) => {
  const message = `nobody${url}use${body}md5forencrypt`;
  const digest = md5(message);
  const data = `${url}-36cd479b6b5-${body}-36cd479b6b5-${digest}`;
  return {
    params: Buffer.from(Aes.encrypt(eapiKey, data), 'base64')
      .toString('hex')
      .toUpperCase(),
  };
};

export const getLyric = async (songmid: string): Promise<string> => {
  // https://github.com/lyswhut/lx-music-desktop/blob/c1e7faa7bf8daeaf3ef4090c30a552931edd6150/src/renderer/utils/musicSdk/wy/lyric.js#L266
  const payload = {
    id: Number.parseInt(songmid),
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
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: eapi(`/${LyricAPI}`, JSON.stringify(payload)),
  });
  const lrc = await res.json();
  // netease lyric has the following format:
  // lrc.lrc.lyric is txt of the typical lrc
  // lrc.tlyric.lyric is translated
  // lrc.yrc.lyric is the karaoke lyric
  // format is '[14400,3600](14400,240,0)At (14640,600,0)break (15240,300,0)of (15540,690,0)day(16230,30,0), (16260,210,0)in (16470,480,0)hope (16950,420,0)we (17370,630,0)rise\n
  // lrc.yrc.ytlrc is the translated karaoke lyric
  // depends on version it may not be karaoke; so a catch mechanism needs to be in
  // ELSE just leave it out
  return lrc?.yrc?.lyric ?? lrc?.lrc?.lyric ?? '';
};
