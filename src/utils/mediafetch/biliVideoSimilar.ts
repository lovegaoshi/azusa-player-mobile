/* eslint-disable @typescript-eslint/no-explicit-any */

import { logger } from "../Logger";
import { regexFetchProps } from "./generic";
import bfetch from "@utils/BiliFetch";
import { Source, BiliMusicTid } from "@enums/MediaFetch";
import SongTS from "@objects/Song";
import { fetchBVID } from "./bilivideo";

/**
 * https://api.bilibili.com/x/web-interface/archive/related?bvid=BV1xx411c7m9
 */
const API =
  "https://api.bilibili.com/x/web-interface/archive/related?bvid={sid}";

const fetchBiliVideoSimilarList = async (bvid: string) => {
  logger.info("calling fetchBiliVideoSimilarList");
  const res = await bfetch(API.replace("{sid}", bvid));
  const json = await res.json();
  return (await fetchBVID(bvid)).concat(
    json.data
      // limit similar videos to music only.
      .filter((v: any) => BiliMusicTid.includes(v.tid))
      .map((data: any) =>
        SongTS({
          cid: data.cid,
          bvid: data.bvid,
          name: data.title,
          nameRaw: data.title,
          singer: data.owner.name,
          singerId: data.owner.mid,
          cover: data.pic,
          lyric: "",
          page: 1,
          duration: data.duration,
          album: data.title,
          source: Source.bilivideo,
        }),
      ),
  );
};

const regexFetch = async ({
  reExtracted,
}: regexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => ({
  songList: await fetchBiliVideoSimilarList(reExtracted[1]!),
});

export default {
  // https://www.bilibili.com/audio/similarsongs/3680653
  regexSearchMatch: /bilibili\.com\/video\/similarvideo\/(BV[^/?]+)/,
  regexFetch,
};
