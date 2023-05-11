import bfetch from './BiliFetch';

const BILI_LIKE_API = 'https://api.bilibili.com/x/web-interface/archive/like';
const BILI_TRIP_API =
  'https://api.bilibili.com/x/web-interface/archive/like/triple';
const BILI_VIDEOPLAY_API =
  'https://api.bilibili.com/x/click-interface/click/web/h5';
const BILI_HEARTBEAT_API =
  'https://api.bilibili.com/x/click-interface/web/heartbeat';
const BILI_VIDEOINFO_API =
  'https://api.bilibili.com/x/web-interface/view?bvid=';

/**
 * see this csdn post.
 * https://blog.csdn.net/zhaowz123456/article/details/125701001
 * @param {string} bvid
 * @param {number} cid
 */
export const initBiliHeartbeat = async ({
  bvid,
  cid,
}: {
  bvid: string;
  cid: string;
}) => {
  if (Number.isNaN(parseInt(cid, 10))) return;
  bfetch(BILI_VIDEOPLAY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: { bvid, cid },
  });
};
