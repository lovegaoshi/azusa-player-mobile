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
import { regexFetchProps } from './generic';
import { songFetch } from './biliaudio';
import { fetchBiliPaginatedAPI } from './paginatedbili';
import VideoInfo from '@objects/VideoInfo';

/**
 * 
 * 
 * https://www.bilibili.com/audio/music-service-c/web/song/of-coll?sid=33443222&pn=1&ps=100
 {
    "code": 0,
    "msg": "success",
    "data": {
        "curPage": 1,
        "pageCount": 1,
        "totalSize": 1,
        "pageSize": 1,
        "data": [
            {
                "id": 3680653,
                "uid": 529249,
                "uname": "诺莺Nox",
                "author": "诺莺Nox",
                "title": "【诺莺Nox】Hope in the Dark (Arrange Ver.)",
                "cover": "http://i0.hdslb.com/bfs/music/571d3749650f64be6a32ac544d3c022e86ddbb7c.jpg",
                "intro": "DA DA DA BI DA DO\n原唱：Luxiem （BV1Zr4y1D7CE）\n翻唱：每天脑袋里有1000个想法的诺莺Nox\n改编/混音：师父师父我的好师父CZT\n曲绘：画风超级好康的失眠岛\nPV：百忙之中救我命的神仙零玖",
                "lyric": "",
                "crtype": 1,
                "duration": 119,
                "passtime": 1672030944,
                "curtime": 1707324722,
                "aid": 599145508,
                "bvid": "BV1UB4y1r7mT",
                "cid": 817079125,
                "msid": 0,
                "attr": 0,
                "limit": 0,
                "activityId": null,
                "limitdesc": "",
                "ctime": 1672030660000,
                "statistic": {
                    "sid": 3680653,
                    "play": 1667,
                    "collect": 20,
                    "comment": 19,
                    "share": 5
                },
                "vipInfo": null,
                "collectIds": [
                    33443222
                ],
                "coin_num": 27
            }
        ]
    }
}
 */
const API =
  'https://www.bilibili.com/audio/music-service-c/web/song/of-menu?sid={sid}&pn={pn}&ps=100';

const fetchBiliAudioColleList = async (
  sid: string,
  progressEmitter: (val: number) => void = () => undefined,
  favList: string[] = []
) => {
  logger.info('calling fetchBiliAudioAMList');

  return await fetchBiliPaginatedAPI({
    url: API.replace('{sid}', sid),
    getMediaCount: (data: any) => data.totalSize,
    getPageSize: (data: any) => data.pageSize,
    getItems: (js: any) => js.data.data,
    progressEmitter,
    favList,
    resolveBiliBVID: v =>
      v.map(
        (data: any) =>
          new VideoInfo(
            data.title,
            data.intro,
            1,
            data.cover,
            { name: data.uname, mid: data.uid, face: data.uid },
            // HACK: pages doesnt really do anything except for counting...
            // needs to be refactored out
            [{} as any],
            data.id,
            data.duration
          )
      ),
  });
};

const regexFetch = async ({
  reExtracted,
  progressEmitter = () => undefined,
  favList,
}: regexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => {
  const videoinfos = await fetchBiliAudioColleList(
    reExtracted[1]!,
    progressEmitter,
    favList
  );
  return { songList: songFetch({ videoinfos }) };
};

const resolveURL = () => undefined;

const refreshSong = (song: NoxMedia.Song) => song;

export default {
  // https://www.bilibili.com/audio/am10624
  regexSearchMatch: /bilibili\.com\/audio\/am(\d+)/,
  regexFetch,
  regexResolveURLMatch: /^biliaudio-/,
  resolveURL,
  refreshSong,
};
