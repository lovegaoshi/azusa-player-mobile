/* eslint-disable @typescript-eslint/no-explicit-any */
import { search } from 'libmuse';
import last from 'lodash/last';

import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';
import { logger } from '@utils/Logger';

export const musePlaylistItemToNoxSong = (val: any, data: any) => {
  try {
    return SongTS({
      cid: `${Source.ytbvideo}-${val.videoId}`,
      bvid: val.videoId,
      name: val.title,
      nameRaw: val.title,
      singer: val.artists[0]?.name ?? 'YT-mix',
      singerId: val.artists[0]?.id ?? '',
      cover: last(val.thumbnails as any[]).url,
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

export const fetchInnerTuneSearch = async (
  searchVal: string,
): Promise<NoxMedia.Song[]> => {
  try {
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
        val?.videoId
          ? musePlaylistItemToNoxSong(val, { title: val.title })
          : [],
      ),
    );
  } catch {
    logger.error(`[muse ytm Search] search ${searchVal} failed!`);
    return [];
  }
};
