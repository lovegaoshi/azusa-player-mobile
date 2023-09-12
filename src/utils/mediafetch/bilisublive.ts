import axios from 'axios';

import { regexFetchProps } from './generic';
import SongTS from '@objects/Song';
import { logger } from '../Logger';
import { CIDPREFIX } from './bililive';
import { fetchBiliPaginatedAPI } from './paginatedbili';
import VideoInfo from '@objects/VideoInfo';

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
    .map(
      (roomInfo: any) =>
        ({
          title: roomInfo.title,
          desc: `b站直播间${roomInfo.room_id}`,
          videoCount: 0,
          picSrc: roomInfo.cover_from_user,
          uploader: { mid: roomInfo.uid, name: roomInfo.uname, face: '' },
          pages: [],
          bvid: roomInfo.room_id,
          duration: 0,
          liveStatus: roomInfo.live_status,
        } as VideoInfo)
      /*
    SongTS({
      cid: `${CIDPREFIX}-${roomInfo.room_id}`,
      bvid: roomInfo.room_id,
      name: roomInfo.title,
      singer: roomInfo.uname,
      cover: roomInfo.cover_from_user,
      singerId: roomInfo.uid,
      album: `b站直播间${roomInfo.room_id}`,
      source: CIDPREFIX,
      isLive: true,
      liveStatus: roomInfo.live_status === 1,
    })
  */
    );
};

const videoInfo2Song = (val: VideoInfo) =>
  SongTS({
    ...val,
    cid: `${CIDPREFIX}-${val.bvid}`,
    source: CIDPREFIX,
    name: val.title,
    singer: val.uploader.name,
    singerId: val.uploader.mid,
    cover: val.picSrc,
    isLive: true,
    liveStatus: val.liveStatus === 1,
    album: val.desc,
  });
const getSubList = async (
  uid: string,
  progressEmitter: (val: number) => void = () => undefined,
  favList: string[] = []
) => {
  // https://api.bilibili.com/x/relation/followings?vmid=3493085134719196
  const videoInfos = await fetchBiliPaginatedAPI({
    // url: `https://api.bilibili.com/x/relation/followings?vmid=${uid}&pn={pn}`,
    url: `https://app.biliapi.net/x/v2/relation/followings?vmid=${uid}&pn={pn}`,
    // dont get more than 5 pages?
    getMediaCount: (data: any) => Math.min(250, data.total),
    // getMediaCount: (data: any) => data.total,
    getPageSize: () => 50,
    getItems: (js: any) => js.data.list,
    progressEmitter,
    favList: [],
    resolveBiliBVID: async bvobjs =>
      await getRoomInfos(bvobjs.map((obj: any) => obj.mid)),
  });
  return videoInfos.map(info => videoInfo2Song(info));
};

const regexFetch = async ({
  reExtracted,
  progressEmitter = () => undefined,
  favList,
}: regexFetchProps) => getSubList(reExtracted[1]!, progressEmitter, favList);

export default {
  regexSearchMatch: /space\.bilibili\.com\/(\d+)\/fans\/follow/,
  regexFetch,
};
