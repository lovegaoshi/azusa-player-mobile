import { regexFetchProps } from './generic';

import SongTS from '@objects/Song';
import { logger } from '../Logger';
import bfetch from '../BiliFetch';
import { CIDPREFIX } from './bililive';

// https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/live/info.md#%E6%89%B9%E9%87%8F%E6%9F%A5%E8%AF%A2%E7%9B%B4%E6%92%AD%E9%97%B4%E7%8A%B6%E6%80%81
const getRoomInfos = async (uids: number[]) => {
  logger.info(`[biliLive] calling fetchVideoInfo of ${uids}`);
  const response = await bfetch(
    'https://api.live.bilibili.com/room/v1/Room/get_status_info_by_uids',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: {
        uids,
      },
    }
  );
  const json = await response.json();
  return Object.values(json.data).map((roomInfo: any) =>
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
  );
};
