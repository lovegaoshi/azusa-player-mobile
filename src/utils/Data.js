/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-undef */
// TODO: migrate to ts; Im working with data.ts.template but doing a poor job.

import Bottleneck from 'bottleneck';
import { v4 as uuidv4 } from 'uuid';
import VideoInfo from '../objects/VideoInfo';
import { extractSongName } from './re';
import bfetch from './BiliFetch';
import { logger } from './Logger';
import { throttler } from './throttle';
import { wbiQuery } from '../store/wbi';

const { biliApiLimiter, biliTagApiLimiter, awaitLimiter } = throttler;

/**
 *  Video src info
 */
const URL_PLAY_URL =
  'https://api.bilibili.com/x/player/playurl?cid={cid}&bvid={bvid}&qn=64&fnval=16';
/**
 *  API that gets the tag of a video. sometimes bilibili identifies the BGM used.
 * https://api.bilibili.com/x/web-interface/view/detail/tag?bvid=BV1sY411i7jP&cid=1005921247
 */
const URL_VIDEO_TAGS =
  'https://api.bilibili.com/x/web-interface/view/detail/tag?bvid={bvid}&cid={cid}';
/**
 *  bilibili API to get an audio's stream src url.
 * https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/audio/musicstream_url.md
 * https://api.bilibili.com/audio/music-service-c/url doesnt work.
 * au must be removed, eg. https://www.bilibili.com/audio/music-service-c/web/url?sid=745350
 */
const URL_AUDIO_PLAY_URL =
  'https://www.bilibili.com/audio/music-service-c/web/url?sid={sid}';
/**
 *  BVID -> CID
 */
const URL_BVID_TO_CID =
  'https://api.bilibili.com/x/player/pagelist?bvid={bvid}&jsonp=jsonp';
/**
 *  Audio Basic Info
 * https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/audio/info.md
 */
const URL_AUDIO_INFO =
  'https://www.bilibili.com/audio/music-service-c/web/song/info?sid={sid}';
/**
 *  Video Basic Info
 */
const URL_VIDEO_INFO =
  'https://api.bilibili.com/x/web-interface/view?bvid={bvid}';
/**
 *  channel series API Extract Info
 */
const URL_BILISERIES_INFO =
  'https://api.bilibili.com/x/series/archives?mid={mid}&series_id={sid}&only_normal=true&sort=desc&pn={pn}&ps=30';
/**
 *  channel series API Extract Info
 */
const URL_BILICOLLE_INFO =
  'https://api.bilibili.com/x/polymer/space/seasons_archives_list?mid={mid}&season_id={sid}&sort_reverse=false&page_num={pn}&page_size=100';
/**
 *  channel API Extract Info
 *  TODO: this keeps having 403 problems. need to investigate in noxplayer.
 */
const URL_BILICHANNEL_INFO =
  'https://api.bilibili.com/x/space/wbi/arc/search?mid={mid}&pn={pn}&jsonp=jsonp&ps=50';
/**
 *  Fav List
 */
const URL_FAV_LIST =
  'https://api.bilibili.com/x/v3/fav/resource/list?media_id={mid}&pn={pn}&ps=20&keyword=&order=mtime&type=0&tid=0&platform=web&jsonp=jsonp';
/**
 *  BILIBILI search API.
 */
const URL_BILI_SEARCH =
  'https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword={keyword}&page={pn}';
/**
 *  LRC Mapping
 */
const URL_LRC_MAPPING =
  'https://raw.githubusercontent.com/kenmingwang/azusa-player-lrcs/main/mappings.txt';
/**
 *  LRC Base
 */
const URL_LRC_BASE =
  'https://raw.githubusercontent.com/kenmingwang/azusa-player-lrcs/main/{songFile}';
/**
 *  QQ SongSearch API
 */
const URL_QQ_SEARCH =
  'https://c.y.qq.com/splcloud/fcgi-bin/smartbox_new.fcg?key={KeyWord}';

/**
 *  QQ SongSearch API POST
 */
const URL_QQ_SEARCH_POST = {
  src: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
  params: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    referrer: 'https://u.qq.com/',
    body: {
      comm: {
        ct: '19',
        cv: '1859',
        uin: '0',
      },
      req: {
        method: 'DoSearchForQQMusicDesktop',
        module: 'music.search.SearchCgiService',
        param: {
          grp: 1,
          num_per_page: 10,
          page_num: 1,
          query: '',
          search_type: 0,
        },
      },
    },
  },
};

/**
 *  QQ LyricSearchAPI
 */
const URL_QQ_LYRIC =
  'https://i.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg?songmid={SongMid}&g_tk=5381&format=json&inCharset=utf8&outCharset=utf-8&nobase64=1';

export const ENUMS = {
  audioType: 'audio',
  youtube: 'youtube.video',
};

/**
 * a parent method that returns the media's stream url given an id.
 * @param {string} bvid media's id.
 * @param {string} cid optional in video; if not provided, bvid is used to fetch cid. note
 * some videos have episodes that this may not be accurate. in other formats (eg biliAudio)
 * its used as an identifier.
 * @returns promise that resolves the media stream url.
 */
export const fetchPlayUrlPromise = async (bvid, cid) => {
  const cidStr = String(cid);
  if (cidStr.startsWith(ENUMS.audioType)) {
    return fetchAudioPlayUrlPromise(bvid);
  }
  return fetchVideoPlayUrlPromise(bvid, cidStr);
};

/**
 * returns the bilibili video stream url given a bvid and cid.
 * @param {string} bvid video's bvid. starts with BV.
 * @param {string | undefined} cid optional; if not provided, bvid is used to fetch cid. note
 * some videos have episodes that this may not be accurate.
 * @returns
 */
export const fetchVideoPlayUrlPromise = async (
  bvid,
  cid,
  extractType = 'AudioUrl'
) => {
  logger.debug(
    `fethcVideoPlayURL: ${URL_PLAY_URL.replace('{bvid}', bvid).replace(
      '{cid}',
      cid
    )} with ${extractType}`
  );
  // HACK:  this should be a breaking change that stringified cid
  // will never be not true.
  if (!cid || cid.includes('null')) {
    cid = await fetchCID(bvid);
  }
  try {
    const res = await bfetch(
      URL_PLAY_URL.replace('{bvid}', bvid).replace('{cid}', cid)
    );
    const json = await res.json();
    return extractResponseJson(json, extractType);
  } catch (e) {
    logger.error(e.message);
    throw e;
  }
};

/**
 * returns the bilibili video stream url given a bvid and cid.
 * @param {string} bvid video's bvid. starts with BV.
 * @param {string} cid optional; if not provided, bvid is used to fetch cid. note
 * some videos have episodes that this may not be accurate.
 * @returns
 */
const fetchVideoTagPromiseRaw = async ({ bvid, cid }) => {
  const req = await bfetch(
    URL_VIDEO_TAGS.replace('{bvid}', bvid).replace('{cid}', cid)
  );
  const json = await req.json();
  try {
    if (json.data[0].tag_type === 'bgm') {
      return json.data[0].tag_name;
    }
    return null;
  } catch (e) {
    logger.error(e.message);
    logger.warn(
      `fetching videoTag for ${bvid}, ${cid} failed. if ${cid} is a special tag its expected.`
    );
    return null;
  }
};

export const biliAPILimiterWrapper = async (
  params,
  func = () => {},
  progressEmit = () => {}
) => {
  return biliApiLimiter.schedule(() => {
    progressEmit();
    return func(params);
  });
};

export const fetchVideoTagPromise = async ({ bvid, cid }) => {
  return biliTagApiLimiter.schedule(() =>
    fetchVideoTagPromiseRaw({ bvid, cid })
  );
};

/**
 * returns the bilibili audio stream url given a auid/sid.
 * @param {string} bvid audio's auid. starts with AU. eg.
 * https://www.bilibili.com/audio/au745350
 * @returns
 */
export const fetchAudioPlayUrlPromise = async sid => {
  try {
    logger.debug(
      `fethcAudioPlayURL:${URL_AUDIO_PLAY_URL.replace('{sid}', sid)}`
    );
    const res = await bfetch(URL_AUDIO_PLAY_URL.replace('{sid}', sid));
    const json = await res.json();
    return json.data.cdns[0];
  } catch (e) {
    logger.error(e.message);
    throw e;
  }
};

/**
 *
 * @param {string} bvid
 * @returns
 */
export const fetchCID = async bvid => {
  // logger.log('Data.js Calling fetchCID:' + URL_BVID_TO_CID.replace("{bvid}", bvid))
  const res = await bfetch(URL_BVID_TO_CID.replace('{bvid}', bvid));
  const json = await res.json();
  const cid = extractResponseJson(json, 'CID');
  return cid;
};

// Refactor needed for this func
export const fetchLRC = async (name, setLyric, setSongTitle) => {
  // logger.log('Data.js Calling: fetchLRC')
  // Get song mapping name and song name from title
  const res = await bfetch(URL_LRC_MAPPING);
  const mappings = await res.text();
  const songs = mappings.split('\n');
  const songName = extractSongName(name);
  setSongTitle(songName);

  const songFile = songs.find((v, i, a) => v.includes(songName));
  // use song name to get the LRC
  try {
    const lrc = await bfetch(URL_LRC_BASE.replace('{songFile}', songFile));
    if (lrc.status !== '200') {
      setLyric('[00:00.000] 无法找到歌词');
      return;
    }

    const text = await lrc.text();
    setLyric(text.replaceAll('\r\n', '\n'));
    return text.replaceAll('\r\n', '\n');
  } catch (error) {
    setLyric('[00:00.000] 无法找到歌词');
  }
};

/**
 *
 * @param {string} bvid
 * @returns
 */
export const fetchVideoInfoRaw = async ({ bvid }) => {
  logger.info(
    `calling fetchVideoInfo of ${bvid} of ${URL_VIDEO_INFO.replace(
      '{bvid}',
      bvid
    )}`
  );
  try {
    const res = await bfetch(URL_VIDEO_INFO.replace('{bvid}', bvid));
    const json = await res.json();
    const { data } = json;
    const v = new VideoInfo(
      data.title,
      data.desc,
      data.videos,
      data.pic,
      data.owner,
      data.pages.map(s => {
        return { bvid, part: s.part, cid: s.cid, duration: s.duration };
      }),
      bvid,
      data.duration
    );
    return v;
  } catch (error) {
    logger.error(error.message);
    logger.warn(`Some issue happened when fetching ${bvid}`);
    throw error;
  }
};

/**
 *
 * @param {string} bvid
 * @param {function} progressEmit
 * @returns
 */
export const fetchVideoInfo = async (bvid, progressEmit = () => {}) => {
  return biliAPILimiterWrapper({ bvid }, fetchVideoInfoRaw, progressEmit);
};

/**
 *
 * @param {string} sid sid of the bili audio; note au needs to be removed, this is
 * technically an int.
 * @returns
 */
export const fetchAudioInfoRaw = async sid => {
  logger.info('calling fetcAudioInfo');
  const res = await bfetch(URL_AUDIO_INFO.replace('{sid}', sid));
  const json = await res.json();
  try {
    const { data } = json;
    const v = new VideoInfo(
      data.title,
      data.intro,
      1,
      data.cover,
      { name: data.uname, mid: data.uid, duration: data.duration },
      [{ cid: ENUMS.audioType }],
      sid,
      data.duration
    );
    return v;
  } catch (error) {
    logger.error(error.message);
    logger.warn(`Some issue happened when fetching ${sid}`);
  }
};

/**
 * fetch biliseries. copied from yt-dlp.
 * unlike other APIs, biliseries API can return all videos in the series by using page number = 0.
 * thus this does not need to use the generic paginated function.
 * @param {string} mid
 * @param {string} sid
 * @param {function} progressEmitter
 * @param {array} favList
 * @returns
 */
export const fetchBiliSeriesList = async (
  mid,
  sid,
  progressEmitter,
  favList = []
) => {
  logger.info('calling fetchBiliSeriesList');
  const page = 0;
  const res = await bfetch(
    URL_BILISERIES_INFO.replace('{mid}', mid)
      .replace('{sid}', sid)
      .replace('{pn}', page)
  );
  const json = await res.json();
  const { data } = json;

  const BVidPromises = [];
  for (let i = 0, n = data.archives.length; i < n; i++) {
    if (favList.includes(data.archives[i].bvid)) {
      logger.debug(
        'fetchBiliSeriesList: skipped duplicate bvid during rss feed update',
        data.archives[i].bvid
      );
      continue;
    }
    BVidPromises.push(
      fetchVideoInfo(data.archives[i].bvid, () => {
        progressEmitter(parseInt((100 * (i + 1)) / data.archives.length));
      })
    );
  }
  return (await Promise.all(BVidPromises)).filter(item => item !== undefined);
};

export const fetchiliBVIDs = async (BVids, progressEmitter = () => {}) => {
  const BVidLen = BVids.length;
  const BVidPromises = BVids.map((bvid, index) =>
    fetchVideoInfo(bvid, () =>
      progressEmitter(parseInt((100 * (index + 1)) / BVidLen))
    )
  );
  return await Promise.all(BVidPromises);
};

/**
 * a universal bvid retriever for all bilibili paginated APIs. used to reduce
 * redundant codes in bilibili collection, favlist and channel.
 * @param {string} url
 * @param {function} getMediaCount
 * @param {function} getPageSize
 * @param {function} getItems
 * @param {function} progressEmitter
 * @param {array} favList
 * @returns
 */
export const fetchBiliPaginatedAPI = async ({
  url,
  getMediaCount,
  getPageSize,
  getItems,
  progressEmitter,
  favList = [],
  limiter = biliTagApiLimiter,
  params = undefined,
  resolveBiliBVID = async (bvobjs, progressEmitter) =>
    await fetchiliBVIDs(
      bvobjs.map(obj => obj.bvid),
      progressEmitter
    ),
}) => {
  const wbiAwareFetch = url.includes('/wbi/') ? wbiQuery : bfetch;
  const res = await wbiAwareFetch(url.replace('{pn}', 1), params);
  const { data } = await res.clone().json();
  const mediaCount = getMediaCount(data);
  const BVids = [];
  const pagesPromises = [res];
  for (
    let page = 2, n = Math.ceil(mediaCount / getPageSize(data));
    page <= n;
    page++
  ) {
    pagesPromises.push(
      limiter.schedule(() => wbiAwareFetch(url.replace('{pn}', page), params))
    );
  }
  const resolvedPromises = await Promise.all(pagesPromises);
  await Promise.all(
    resolvedPromises.map(async pages => {
      return pages
        .json()
        .then(parsedJson => {
          console.debug('jsion', parsedJson);
          getItems(parsedJson).forEach(m => {
            if (!favList.includes(m.bvid)) BVids.push(m);
          });
        })
        .catch(err => {
          logger.error(err.message);
          pages.text().then(logger.debug);
        });
    })
  );
  // i dont know the smart way to do this out of the async loop, though luckily that O(2n) isnt that big of a deal
  return (await resolveBiliBVID(BVids, progressEmitter)).filter(
    item => item !== undefined
  );
};

/**
 * a universal bvid retriever for all bilibili paginated APIs. used to reduce
 * redundant codes in bilibili collection, favlist and channel.
 * @returns
 */
export const fetchAwaitBiliPaginatedAPI = async ({
  url,
  getMediaCount,
  getPageSize,
  getItems,
  progressEmitter,
  favList = [],
  limiter = biliTagApiLimiter,
  params = undefined,
  resolveBiliBVID = async (bvobjs, progressEmitter) =>
    await fetchiliBVIDs(
      bvobjs.map(obj => obj.bvid),
      progressEmitter
    ),
}) => {
  const wbiAwareFetch = url.includes('/wbi/') ? wbiQuery : bfetch;
  // helper function that returns true if more page resolving is needed.
  const resolvePageJson = async (BVids, json) => {
    for (const item of getItems(json)) {
      if (favList.includes(item.bvid)) {
        return false;
      }
      BVids.push(item);
    }
    return true;
  };

  const res = await wbiAwareFetch(url.replace('{pn}', 1), params);
  const json = await res.json();
  const mediaCount = getMediaCount(json.data);
  const BVids = [];
  if (await resolvePageJson(BVids, json)) {
    for (
      let page = 2, n = Math.ceil(mediaCount / getPageSize(json.data));
      page <= n;
      page++
    ) {
      const subRes = await limiter.schedule(() =>
        wbiAwareFetch(url.replace('{pn}', page), params)
      );
      const subJson = await subRes.json();
      if (!(await resolvePageJson(BVids, subJson))) {
        break;
      }
    }
  }
  // i dont know the smart way to do this out of the async loop, though luckily that O(2n) isnt that big of a deal
  return (await resolveBiliBVID(BVids, progressEmitter)).filter(
    item => item !== undefined
  );
};

/**
 *
// copied from ytdlp. applies to collections such as:
// https://space.bilibili.com/287837/channel/collectiondetail?sid=793137
 * @param {string} mid
 * @param {string} sid
 * @param {function} progressEmitter
 * @param {array} favList
 * @returns
 */
export const fetchBiliColleList = async (
  mid,
  sid,
  progressEmitter,
  favList = []
) => {
  logger.info('calling fetchBiliColleList');

  return fetchBiliPaginatedAPI({
    url: URL_BILICOLLE_INFO.replace('{mid}', mid).replace('{sid}', sid),
    getMediaCount: data => data.meta.total,
    getPageSize: data => data.page.page_size,
    getItems: js => js.data.archives,
    progressEmitter,
    favList,
    limiter: biliApiLimiter,
  });
};

/**
 *
// copied from ytdlp. applies to bibibili channels such as:
// https://space.bilibili.com/355371630/video
 * @param {string} url the actual url. because url may have url search params such as tid,
 * the actual url is needed here for further parsing, instead of simply passing the bili user UID
 * @param {function} progressEmitter
 * @param {array} favList
 * @returns
 */
export const fetchBiliChannelList = async (
  url,
  progressEmitter,
  favList = []
) => {
  logger.info('calling fetchBiliChannelList');
  const mid = /.*space.bilibili\.com\/(\d+)\/video.*/.exec(url)[1];
  let searchAPI = URL_BILICHANNEL_INFO.replace('{mid}', mid);
  const tidVal = /tid=(\d+)/.exec(url);
  if (tidVal) {
    // TODO: do this properly with another URLSearchParams instance
    searchAPI += `&tid=${String(tidVal[1])}`;
  }
  return fetchAwaitBiliPaginatedAPI({
    url: searchAPI,
    getMediaCount: data => data.page.count,
    getPageSize: data => data.page.ps,
    getItems: js => js.data.list.vlist,
    progressEmitter,
    favList,
    limiter: awaitLimiter,
  });
};

/**
 *
// copied from ytdlp. applies to bibibili fav lists such as:
// https://space.bilibili.com/355371630/video
 * @param {string} mid
 * @param {function} progressEmitter
 * @param {array} favList
 * @returns
 */
export const fetchFavList = async (mid, progressEmitter, favList = []) => {
  logger.info('calling fetchFavList');

  return fetchBiliPaginatedAPI({
    url: URL_FAV_LIST.replace('{mid}', mid),
    getMediaCount: data => data.info.media_count,
    getPageSize: () => 20,
    getItems: js => js.data.medias,
    progressEmitter,
    favList,
  });
};

/**
 *
// copied from ytdlp. applies to bibibili fav lists such as:
// https://space.bilibili.com/355371630/video
 * @param {string} mid
 * @param {function} progressEmitter
 * @returns
 */
export const fetchBiliSearchList = async (
  kword,
  progressEmitter,
  fastSearch = false
) => {
  function timestampToSeconds(timestamp) {
    const timeArray = timestamp.split(':').map(parseFloat);
    let seconds = 0;
    if (timeArray.length === 1) {
      // check if both hours and minutes components are missing
      seconds = timeArray[0]; // the timestamp only contains seconds
    } else if (timeArray.length === 2) {
      // check if hours component is missing
      seconds = timeArray[0] * 60 + timeArray[1]; // calculate seconds from minutes and seconds
    } else if (timeArray.length === 3) {
      seconds = timeArray[0] * 3600 + timeArray[1] * 60 + timeArray[2]; // calculate total seconds
    }
    return seconds;
  }

  const fastSearchResolveBVID = async bvobjs => {
    /**
     * cids should be resolved at this stage,
     * or on the fly using fetchCID. the latter saves
     * search time but now song.id loses identification.
    const resolvedCIDs = await Promise.all(
      bvobjs.map(obj => fetchCID(obj.bvid))
    );
     */
    return bvobjs.map(
      (obj, index) =>
        new VideoInfo(
          obj.title.replaceAll(/<[^<>]*em[^<>]*>/g, ''),
          obj.description,
          1,
          `https:${obj.pic}`,
          { mid: obj.mid, name: obj.author, face: obj.upic },
          [
            {
              bvid: obj.bvid,
              part: 1,
              cid: `null-${uuidv4()}`, // resolvedCids[index]
              duration: timestampToSeconds(obj.duration),
            },
          ],
          obj.bvid,
          timestampToSeconds(obj.duration)
        )
    );
  };

  // this API needs a random buvid3 value, or a valid SESSDATA;
  // otherwise will return error 412. for users didnt login to bilibili,
  // setting a random buvid3 would enable this API.
  let val = [];
  try {
    val = await fetchBiliPaginatedAPI({
      url: URL_BILI_SEARCH.replace('{keyword}', kword),
      getMediaCount: data => Math.min(data.numResults, data.pagesize * 2),
      getPageSize: data => data.pagesize,
      getItems: js => js.data.result,
      progressEmitter,
      favList: [],
      limiter: biliApiLimiter,
      params: {
        method: 'GET',
        headers: {
          referer: 'https://www.bilibili.com',
          cookie: 'buvid3=coolbeans',
        },
        credentials: 'omit',
      },
      resolveBiliBVID: fastSearch
        ? async (bvobjs, progressEmitter) => await fastSearchResolveBVID(bvobjs)
        : undefined,
    });
  } catch (e) {
    logger.error(e.message);
  }
  return val;
};

/**
 * used to resolve a bilibili 509 error.
 * now bili completely switched to wbi signatures,
 * leaving this for legacy reasons in case we have this stupid problem
 * @param {} res
 * @returns
 */
const extract509Json = async res => {
  let resText = await res.text();
  if (resText.includes('"code":-509,')) {
    resText = resText
      .slice(resText.indexOf('}') + 1)
      .replaceAll('\n', '')
      .replaceAll('\r', '');
  }
  return JSON.parse(resText);
};

/**
 * Private Util to extract json, see https://github.com/SocialSisterYi/bilibili-API-collect
 * @param {Object} json
 * @param {string} field
 * @returns
 */
const extractResponseJson = (json, field) => {
  switch (field) {
    case 'AudioUrl':
      return json.data.dash.audio[0].baseUrl;
    case 'VideoUrl':
      return json.data.dash.video[0].baseUrl;
    case 'CID':
      return json.data[0].cid;
    case 'AudioInfo':
      return {};
    default:
      throw new Error(`invalid field type: ${field} to parse JSON response`);
  }
};

export const searchLyricOptions = async searchKey => {
  if (!searchKey) {
    throw new Error('Search key is required');
  }
  logger.info(`calling searchLyricOptions: ${searchKey}`);
  const API = getQQSearchAPI(searchKey);
  const res = await bfetch(API.src, API.params);
  const json = await res.json();
  logger.debug(json);
  const data = json.req.data.body.song.list;
  return data.map((s, v) => ({
    key: s.mid,
    songMid: s.mid,
    label: `${v}. ${s.name} / ${s.singer[0].name}`,
  }));
};

const getQQSearchAPI = searchKey => {
  let API = JSON.parse(JSON.stringify(URL_QQ_SEARCH_POST));
  API.params.body.req.param.query = searchKey;
  API.params.body = JSON.stringify(API.params.body);
  return API;
};

export const searchLyric = async (searchMID, setLyric) => {
  logger.info('calling searchLyric');
  const res = await bfetch(URL_QQ_LYRIC.replace('{SongMid}', searchMID));
  const json = await res.json();
  if (!json.lyric) {
    setLyric('[00:00.000] 无法找到歌词,请手动搜索');
    return;
  }

  let finalLrc = json.lyric;

  // Merge trans Lyrics
  if (json.trans) {
    finalLrc = `${json.trans}\n${finalLrc}`;
  }
  // logger.log(finalLrc)
  setLyric(finalLrc);
};
