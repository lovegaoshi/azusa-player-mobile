import { getBiliJct } from "@utils/Bilibili/biliCookies";
import bfetch from "@utils/BiliFetch";
import { logger } from "@utils/Logger";
import { throttler } from "../throttle";
import { bv2av as BVIDtoAID } from "../bv2av";

const BILI_LIKE_API = "https://api.bilibili.com/x/web-interface/archive/like";
const BILI_RELATED_API =
  "https://api.bilibili.com/x/web-interface/archive/related?bvid={bvid}";
const BILI_TRIP_API =
  "https://api.bilibili.com/x/web-interface/archive/like/triple";
const BILI_VIDEOPLAY_API =
  "https://api.bilibili.com/x/click-interface/click/web/h5";
const BILI_VIDEOINFO_API =
  "https://api.bilibili.com/x/web-interface/view?bvid=";
const BILI_FAV_API = "https://api.bilibili.com/x/v3/fav/resource/deal";

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
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: { bvid, cid },
    }),
  );
};

// https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/video/action.md#%E5%88%A4%E6%96%AD%E8%A7%86%E9%A2%91%E6%98%AF%E5%90%A6%E8%A2%AB%E7%82%B9%E8%B5%9E%E5%8F%8C%E7%AB%AF
export const checkBVLiked = async (bvid: string) => {
  try {
    const res = await fetch(
      `https://api.bilibili.com/x/web-interface/archive/has/like?bvid=${bvid}`,
      {
        credentials: "include",
        referrer: `https://www.bilibili.com/video/${bvid}/`,
      },
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
    const biliJct = await getBiliJct();
    if (!biliJct) return;
    const res = await bfetch(BILI_LIKE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: { bvid, like: "1", csrf: biliJct },
      referrer: `https://www.bilibili.com/video/${bvid}/`,
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    logger.error(`send BVLike ${bvid} failed with error ${error}`);
  }
};

export const sendBVTriple = async (bvid: string) => {
  try {
    const biliJct = await getBiliJct();
    if (!biliJct) return;
    const res = await bfetch(BILI_TRIP_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: { bvid, like: "1", csrf: biliJct },
      referrer: `https://www.bilibili.com/video/${bvid}/`,
      credentials: "include",
    });
    return await res.json();
  } catch (error) {
    logger.error(`send BVLike ${bvid} failed with error ${error}`);
  }
};

/**
 * checks a video played count, for debug use.
 */
export const checkBiliVideoPlayed = (bvid: string) => {
  fetch(BILI_VIDEOINFO_API + bvid)
    .then((res) => res.json())
    .then((json) => logger.debug(`${bvid} view count:${json.data.stat.view}`))
    .catch(logger.error);
};

export const sendBVFavorite = async (
  bvid: string,
  addfav: string[] = [],
  removefav: string[] = [],
) => {
  try {
    const biliJct = await getBiliJct();
    if (!biliJct) return;
    const res = await bfetch(BILI_FAV_API, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      referrer: `https://www.bilibili.com/video/${bvid}/`,
      body: {
        rid: BVIDtoAID(bvid as `BV1${string}`),
        add_media_ids: addfav.join(","),
        del_media_ids: removefav.join(","),
        csrf: biliJct,
        type: "2",
      },
    });
    return await res.json();
  } catch (e) {
    logger.error(`BVID favorite POST failed ${String(e)};`);
  }
};

export const biliSuggest = async (bvid: string) => {
  logger.debug(`fetching biliSuggest wiht ${bvid}`);
  const res = await bfetch(BILI_RELATED_API.replace("{bvid}", bvid)),
    json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return json.data as any[];
};
