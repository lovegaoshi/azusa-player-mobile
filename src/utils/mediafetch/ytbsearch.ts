/* eslint-disable @typescript-eslint/no-explicit-any */
import { search } from "libmuse";

import { CIDPREFIX } from "./ytbvideo";
import SongTS from "@objects/Song";
import { Source } from "@enums/MediaFetch";

const musePlaylistItemToNoxSong = (val: any, data: any) => {
  try {
    return SongTS({
      cid: `${CIDPREFIX}-${val.videoId}`,
      bvid: val.videoId,
      name: val.title,
      nameRaw: val.title,
      singer: val.artists[0].name,
      singerId: val.artists[0].id,
      cover: val.thumbnails[val.thumbnails.length - 1].url,
      lyric: "",
      page: 1,
      duration: val.duration_seconds,
      album: data.title,
      source: Source.ytbvideo,
      metadataOnLoad: true,
    });
  } catch {
    console.error(`[musePlaylistParse] fail: ${JSON.stringify(val)}`);
    return [];
  }
};

const fetchInnerTuneSearch = async (
  searchVal: string,
): Promise<NoxMedia.Song[]> => {
  const searchData = await Promise.all([
    search(searchVal, {
      filter: "songs",
    }),
    search(searchVal, {
      filter: "videos",
    }),
  ]);
  return searchData.flatMap((searchList) =>
    searchList.categories[0].results.flatMap((val: any) =>
      val && val.videoId
        ? musePlaylistItemToNoxSong(val, { title: val.title })
        : [],
    ),
  );
};

interface regexFetchProps {
  url: string;
  progressEmitter: (val: number) => void;
  fastSearch?: boolean;
  cookiedSearch?: boolean;
}

const regexFetch = async ({
  url,
}: regexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => {
  return { songList: await fetchInnerTuneSearch(url) };
};

export default {
  regexSearchMatch: /youtu.*list=([^&]+)/,
  regexFetch,
};
