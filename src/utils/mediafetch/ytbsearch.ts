import { search, SearchSong } from 'libmuse';

import { CIDPREFIX } from './ytbvideo';
import SongTS from '@objects/Song';
import logger from '../Logger';

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
      lyric: '',
      page: 1,
      duration: val.duration_seconds,
      album: data.title,
    });
  } catch {
    console.error(`[musePlaylistParse] fail: ${JSON.stringify(val)}`);
  }
};

const fetchInnerTuneSearch = async (
  searchVal: string
): Promise<NoxMedia.Song[]> => {
  const playlistData = await search(searchVal, {
    filter: 'songs',
  });
  return playlistData.categories[0].results
    .flatMap((val: any) =>
      val && val.videoId
        ? musePlaylistItemToNoxSong(val, { title: val.title })
        : []
    )
    .filter((val): val is NoxMedia.Song => val !== undefined);
};

interface regexFetchProps {
  url: string;
  progressEmitter: (val: number) => void;
  fastSearch?: boolean;
  cookiedSearch?: boolean;
}

const regexFetch = async ({ url, fastSearch }: regexFetchProps) => {
  return await fetchInnerTuneSearch(url);
};

export default {
  regexSearchMatch: /youtu.*list=([^&]+)/,
  regexFetch,
};
