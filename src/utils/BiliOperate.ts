import Bottleneck from 'bottleneck';
import CookieManager from '@react-native-cookies/cookies';
import bfetch from './BiliFetch';
import { throttler } from './throttle';
import { logger } from './Logger';

const BILI_LIKE_API = 'https://api.bilibili.com/x/web-interface/archive/like';
const BILI_TRIP_API =
  'https://api.bilibili.com/x/web-interface/archive/like/triple';
const BILI_VIDEOPLAY_API =
  'https://api.bilibili.com/x/click-interface/click/web/h5';
const BILI_HEARTBEAT_API =
  'https://api.bilibili.com/x/click-interface/web/heartbeat';
const BILI_VIDEOINFO_API =
  'https://api.bilibili.com/x/web-interface/view?bvid=';

const { bilih5ApiLimiter } = throttler;

/**
 * see this csdn post.
 * https://blog.csdn.net/zhaowz123456/article/details/125701001
 */
export const initBiliHeartbeat = async ({
  bvid,
  cid,
}: {
  bvid: string;
  cid: string;
}) => {
  if (Number.isNaN(parseInt(cid, 10))) return;
  bilih5ApiLimiter.schedule(() =>
    bfetch(BILI_VIDEOPLAY_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: { bvid, cid },
    })
  );
};

// https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/video/action.md#%E5%88%A4%E6%96%AD%E8%A7%86%E9%A2%91%E6%98%AF%E5%90%A6%E8%A2%AB%E7%82%B9%E8%B5%9E%E5%8F%8C%E7%AB%AF
export const checkBVLiked = async (bvid: string) => {
  try {
    const res = await fetch(
      `https://api.bilibili.com/x/web-interface/archive/has/like?bvid=${bvid}`,
      {
        credentials: 'include',
        referrer: `https://www.bilibili.com/video/${bvid}/`,
      }
    );
    const json = await res.json();
    return json.data;
  } catch (error) {
    logger.error(`check BVLike ${bvid} failed with error ${error}`);
  }
};

/**
 * use https://api.bilibili.com/x/web-interface/archive/like to like a video.
 * looked up json API return.
 */
export const sendBVLike = async (bvid: string) => {
  try {
    const biliJct = (await CookieManager.get('https://www.bilibili.com'))[
      'bili_jct'
    ]?.value;
    if (!biliJct) return;
    const res = await bfetch(BILI_LIKE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: { bvid, like: '1', csrf: biliJct },
      referrer: `https://www.bilibili.com/video/${bvid}/`,
      credentials: 'include',
    });
    return await res.json();
  } catch (error) {
    logger.error(`send BVLike ${bvid} failed with error ${error}`);
  }
};

export const sendBVTriple = async (bvid: string) => {
  try {
    const biliJct = (await CookieManager.get('https://www.bilibili.com'))[
      'bili_jct'
    ]?.value;
    if (!biliJct) return;
    const res = await bfetch(BILI_TRIP_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: { bvid, like: '1', csrf: biliJct },
      referrer: `https://www.bilibili.com/video/${bvid}/`,
      credentials: 'include',
    });
    return await res.json();
  } catch (error) {
    logger.error(`send BVLike ${bvid} failed with error ${error}`);
  }
};

/**
 * checks a video played count, for debug use.
 * @param {string} bvid
 */
export const checkBiliVideoPlayed = (bvid: string) => {
  fetch(BILI_VIDEOINFO_API + bvid)
    .then(res => res.json())
    .then(json => logger.debug(`${bvid} view count:${json.data.stat.view}`))
    .catch(logger.error);
};
