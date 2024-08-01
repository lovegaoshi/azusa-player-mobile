/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * refactor:
 * bilisearch workflow:
 * reExtractSearch matches regex patterns and use the corresponding fetch functions;
 * fetch function takes extracted and calls a dataProcess.js fetch function;
 * dataprocess fetch function fetches VIDEOINFO using data.js fetch function, then parses into SONGS
 * data.js fetch function fetches VIDEOINFO.
 * steps to refactor:
 * each site needs a fetch to parse regex extracted, a videoinfo fetcher and a song fetcher.
 */
import { logger } from '../Logger';
import bfetch from '@utils/BiliFetch';
import { Source } from '@enums/MediaFetch';
import SongTS from '@objects/Song';

/**
 *
 *
 * https://www.bilibili.com/audio/music-service-c/web/song/similar?sid=3680653
{
    "code": 0,
    "msg": "success",
    "data": [
        {
            "id": 663492,
            "uid": 20344454,
            "uname": "Fia_Official",
            "author": "MONKEY MAJIK",
            "title": "『Nightcore』- Headlight - MONKEY MAJIK",
            "cover": "https://i0.hdslb.com/bfs/music/9c5f00936a359d275b02f19cc432396301c475ec.jpg",
            "intro": "Song：Headlight",
            "lyric": "https://i0.hdslb.com/bfs/music/1573887101663492.lrc",
            "crtype": 1,
            "duration": 291,
            "passtime": 1573887141,
            "curtime": 1707328357,
            "aid": 0,
            "bvid": "",
            "cid": 0,
            "msid": 0,
            "attr": 0,
            "limit": 0,
            "activityId": null,
            "limitdesc": "",
            "ctime": 1545013197000,
            "statistic": {
                "sid": 663492,
                "play": 8234,
                "collect": 203,
                "comment": 21,
                "share": 14
            },
            "vipInfo": null,
            "collectIds": [],
            "coin_num": 55
        },
 */
const API =
  'https://www.bilibili.com/audio/music-service-c/web/song/similar?sid={sid}';

const fetchBiliAudioSimilarList = async (sid: string) => {
  logger.info('calling fetchBiliAudioSimilarList');
  const res = await bfetch(API.replace('{sid}', sid));
  const json = await res.json();
  return json.data.map((data: any) =>
    SongTS({
      cid: `${Source.biliaudio}-${data.id}`,
      bvid: data.id,
      name: data.title,
      nameRaw: data.title,
      singer: data.uname,
      singerId: data.uid,
      cover: data.cover,
      lyric: '',
      page: 1,
      duration: data.duration,
      album: data.title,
      source: Source.biliaudio,
    })
  );
};

const regexFetch = async ({
  reExtracted,
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: await fetchBiliAudioSimilarList(reExtracted[1]),
});

const resolveURL = () => undefined;

export default {
  // https://www.bilibili.com/audio/similarsongs/3680653
  regexSearchMatch: /bilibili\.com\/audio\/similarsongs\/(\d+)/,
  regexFetch,
  regexResolveURLMatch: /^biliaudio-/,
  resolveURL,
};
