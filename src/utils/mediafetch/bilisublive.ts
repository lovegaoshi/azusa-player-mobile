/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

import SongTS from '@objects/Song';
import { logger } from '../Logger';
import { Source } from '@enums/MediaFetch';
import { fetchBiliPaginatedAPI } from './paginatedbili';
import { biliApiLimiter } from './throttle';
import bfetch from '@utils/BiliFetch';

// https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/live/info.md#%E6%89%B9%E9%87%8F%E6%9F%A5%E8%AF%A2%E7%9B%B4%E6%92%AD%E9%97%B4%E7%8A%B6%E6%80%81
const getRoomInfos = async (uids: number[]) => {
  logger.info(`[biliLive] calling fetchVideoInfo of ${uids}`);
  const response = await axios.post(
    'https://api.live.bilibili.com/room/v1/Room/get_status_info_by_uids',
    { uids },
    { withCredentials: false }
  );
  const json = response.data;
  return Object.values(json.data)
    .sort((a: any, b: any) => {
      if (a.live_status === b.live_status) {
        // If both objects have the same 'check' value, maintain the original order.
        return 0;
      }
      if (a.live_status === 1) {
        // If 'a' has 'check' set to true, it should come before 'b'.
        return -1;
      } else {
        // If 'a' has 'check' set to false, it should come after 'b'.
        return 1;
      }
    })
    .map((roomInfo: any) =>
      SongTS({
        cid: `${Source.biliLive}-${roomInfo.room_id}`,
        bvid: roomInfo.room_id,
        source: Source.biliLive,
        name: roomInfo.title,
        singer: roomInfo.uname,
        singerId: roomInfo.uid,
        cover: roomInfo.cover_from_user,
        isLive: true,
        liveStatus: roomInfo.live_status === 1,
        album: `b站直播间${roomInfo.room_id}`,
      })
    );
};

interface Props {
  uid: string;
  progressEmitter?: NoxUtils.ProgressEmitter;
}

// needs cookie auth
export const _getSubList = async ({ uid }: Props) => {
  // https://api.vc.bilibili.com/dynamic_mix/v1/dynamic_mix/at_list?uid=3493085134719196
  const res = await bfetch(
    `https://api.vc.bilibili.com/dynamic_mix/v1/dynamic_mix/at_list?uid=${uid}`
  );
  const json = await res.json();
  const subUids = json.data.groups
    .map((group: any) => group.items.map((item: any) => item.uid))
    .flat();
  return getRoomInfos(subUids);
};

const getSubList = ({ uid, progressEmitter }: Props) => {
  // https://api.bilibili.com/x/relation/followings?vmid=3493085134719196
  return fetchBiliPaginatedAPI({
    url: `https://app.biliapi.net/x/v2/relation/followings?vmid=${uid}&pn={pn}`,
    // dont get more than 5 pages?
    getMediaCount: (data: any) => Math.min(250, data.total),
    // getMediaCount: (data: any) => data.total,
    getPageSize: () => 50,
    getItems: (js: any) => js.data.list,
    progressEmitter,
    favList: [],
    resolveBiliBVID: bvobjs =>
      biliApiLimiter.schedule(() =>
        getRoomInfos(bvobjs.map((obj: any) => obj.mid))
      ),
  });
};

const regexFetch = async ({
  reExtracted,
  progressEmitter = () => undefined,
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: await getSubList({ uid: reExtracted[1], progressEmitter }),
});

export default {
  regexSearchMatch: /space\.bilibili\.com\/(\d+)\/fans\/follow/,
  regexFetch,
};
