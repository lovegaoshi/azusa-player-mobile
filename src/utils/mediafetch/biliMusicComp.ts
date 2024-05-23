import { logger } from "../Logger";
import SongTS from "@objects/Song";
import bfetch from "@utils/BiliFetch";
import { Source } from "@enums/MediaFetch";
import { biliApiLimiter } from "./throttle";

const API =
  "https://api.bilibili.com/x/centralization/interface/music/comprehensive/web/rank?pn={pn}&ps=100";

/**
 * {
    "music_title": "INDUSTRY BABY",
    "music_id": "MA409252544326461790",
    "music_corner": "",
    "cid": "1234770628",
    "jump_url": "",
    "author": "Jack Harlow,Lil Nas X",
    "bvid": "BV1KP4y1t7Ne",
    "album": "MONTERO",
    "aid": "889390376",
    "id": 886135,
    "cover": "http://i0.hdslb.com/bfs/station_src/music_metadata/5f45e4fa4ab1697fa17c29e3ed40a56c.jpg",
    "score": 289413466,
    "related_archive": {
        "aid": "659776909",
        "bvid": "BV1kh4y1Q7eM",
        "cid": "659776909",
        "cover": "http://i2.hdslb.com/bfs/archive/408f6f98a5a4074c3d7a217156b7670e40a43c60.jpg",
        "title": "各个游戏的刻板印象大赏",
        "uid": 3537114098568132,
        "username": "新-硬核的甜瓜",
        "vt_display": "",
        "vv_count": 1504080,
        "is_vt": 0,
        "fname": "综合",
        "duration": 63
    }
},
   */
const rankingToSong = (data: any) =>
  SongTS({
    cid: data.related_archive.cid,
    bvid: data.related_archive.bvid,
    name: data.related_archive.title,
    nameRaw: data.music_title,
    singer: data.related_archive.username,
    singerId: data.related_archive.uid,
    cover: data.related_archive.cover,
    lyric: "",
    page: 1,
    duration: data.related_archive.duration,
    album: data.album,
    source: Source.bilivideo,
  });

export const fetchMusicComp = async (pn = 1): Promise<NoxMedia.Song[]> => {
  logger.info("[biliRanking] calling fetchMusicNew");
  try {
    const res = await biliApiLimiter.schedule(() =>
      bfetch(API.replace("{pn}", String(pn))),
    );
    const json = await res.json();
    return json.data.list
      .map((v: any) => rankingToSong(v))
      .filter((v: NoxMedia.Song) => v.bvid.length > 0);
  } catch (error: any) {
    logger.error(error.message);
    logger.warn("Some issue happened when fetchMusicNew");
    return [];
  }
};
