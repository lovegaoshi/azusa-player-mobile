/* eslint-disable @typescript-eslint/no-explicit-any */
import { search } from 'libmuse';

import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';

const musePlaylistItemToNoxSong = (val: any, data: any) => {
  try {
    return SongTS({
      cid: `${Source.ytbvideo}-${val.videoId}`,
      bvid: val.videoId,
      name: val.title,
      nameRaw: val.title,
      singer: val.artists[0].name,
      singerId: val.artists[0].id,
      cover: val.thumbnails[val.thumbnails.length - 1].url,
      lyric: '',
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
  searchVal: string
): Promise<NoxMedia.Song[]> => {
  const searchData = await Promise.all([
    search(searchVal, {
      filter: 'songs',
    }).catch(() => ({ categories: [{ results: [] }] })),
    search(searchVal, {
      filter: 'videos',
    }).catch(() => ({ categories: [{ results: [] }] })),
  ]);
  return searchData.flatMap(searchList =>
    searchList.categories[0].results.flatMap((val: any) =>
      val && val.videoId
        ? musePlaylistItemToNoxSong(val, { title: val.title })
        : []
    )
  );
};

interface RegexFetchProps {
  url: string;
  progressEmitter: NoxUtils.ProgressEmitter;
  fastSearch?: boolean;
  cookiedSearch?: boolean;
}

const regexFetch = async ({
  url,
}: RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => {
  return { songList: await fetchInnerTuneSearch(url) };
};

export default {
  regexSearchMatch: /youtu.*list=([^&]+)/,
  regexFetch,
};
