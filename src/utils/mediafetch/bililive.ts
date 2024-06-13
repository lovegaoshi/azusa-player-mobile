import SongTS from '@objects/Song';
import { logger } from '../Logger';
import bfetch from '@utils/BiliFetch';
import { biliApiLimiter } from './throttle';
import { Source } from '@enums/MediaFetch';

interface BiliLiveRoomInfo {
  room_id: string;
  live_status: number;
  area_name: string;
  user_cover: string;
  title: string;
}

//https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/live/info.md
const getRoomInfo = async (roomID: string) => {
  const res = await bfetch(
      `https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${roomID}`
    ),
    json = await res.json();
  return json.data as BiliLiveRoomInfo;
};

interface LiverData {
  uid: number;
  uname: string;
  face: string;
}

const getLiver = async (roomID: string) => {
  const res = await bfetch(
    `https://api.live.bilibili.com/room/v1/Room/room_init?id=${roomID}`
  );
  const json = await res.json();
  const uid = json.data.uid;
  const uidRes = await bfetch(
    `https://api.live.bilibili.com/live_user/v1/Master/info?uid=${uid}`
  );
  const uidJson = await uidRes.json();
  return uidJson.data.info as LiverData;
};

const fetchVideoInfoRaw = async (aid: string) => {
  logger.info(`[biliLive] calling fetchVideoInfo of ${aid}`);
  try {
    const roomInfo = await getRoomInfo(aid);
    const liverInfo = await getLiver(roomInfo.room_id);
    return SongTS({
      cid: `${Source.biliLive}-${roomInfo.room_id}`,
      bvid: roomInfo.room_id,
      name: roomInfo.title,
      singer: liverInfo.uname,
      cover: roomInfo.user_cover,
      singerId: aid,
      album: `b站直播间${aid}`,
      source: Source.biliLive,
      isLive: true,
      liveStatus: roomInfo.live_status === 1,
    });
  } catch (error) {
    logger.error(error);
    logger.warn(`Some issue happened when fetching ${aid}`);
    throw error;
  }
};

const fetchVideoInfo = (aid: string) =>
  biliApiLimiter.schedule(() => fetchVideoInfoRaw(aid));

const regexFetch = async ({
  reExtracted,
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: [await fetchVideoInfo(reExtracted[1])],
});

export const _resolveURL = async (
  song: NoxMedia.Song,
  platform: 'h5' | 'web' = 'web'
): Promise<NoxNetwork.ParsedNoxMediaURL> => {
  const req = await bfetch(
    `https://api.live.bilibili.com/room/v1/Room/playUrl?cid=${song.bvid}&platform=${platform}&quality=2`
  );
  const json = await req.json();
  const durl = json.data.durl;
  return { url: durl[durl.length - 1].url };
};

const resolveURL = (song: NoxMedia.Song) => _resolveURL(song);

const refreshSong = async (song: NoxMedia.Song) => {
  try {
    return await fetchVideoInfo(song.bvid);
  } catch {
    return song;
  }
};

export default {
  regexSearchMatch: /live\.bilibili\.com\/(\d+)/,
  regexFetch,
  regexResolveURLMatch: /^bililive-/,
  resolveURL,
  refreshSong,
};
