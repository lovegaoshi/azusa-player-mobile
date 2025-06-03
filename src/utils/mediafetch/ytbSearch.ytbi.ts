import { Video } from 'youtubei.js/dist/src/parser/nodes';
import Search from 'youtubei.js/dist/src/parser/youtube/Search';

import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';
import { ytwebClient } from '@utils/mediafetch/ytbi';
import { logger } from '@utils/Logger';

export const ytbiVideoToNoxSong = (val: Video) =>
  SongTS({
    cid: `${Source.ytbvideo}-${val.video_id}`,
    bvid: val.video_id,
    name: val.title.text ?? 'N/A',
    nameRaw: val.title.text ?? 'N/A',
    singer: val.author.name,
    singerId: val.author.id,
    cover: val.thumbnails[0].url,
    lyric: '',
    page: 1,
    duration: val.duration.seconds,
    source: Source.ytbvideo,
    metadataOnLoad: true,
  });

interface SearchResult {
  songs: NoxMedia.Song[];
  playlistData?: Search;
}

interface GetSearch {
  songs: NoxMedia.Song[];
  favList?: string[];
  playlistData?: Search;
  page?: number;
}

const getSearch = async ({
  songs,
  favList = [],
  playlistData,
  page = 0,
}: GetSearch): Promise<SearchResult> => {
  if (page === 0 || playlistData === undefined) {
    return { songs, playlistData };
  }
  const videos = playlistData.videos as Video[];
  const parsedSongs = videos
    .filter(v => v.type === 'Video')
    .map(val =>
      !favList.includes(val.video_id) ? ytbiVideoToNoxSong(val) : [],
    )
    .filter((val): val is NoxMedia.Song => val !== undefined);
  const joinedSongs = songs.concat(parsedSongs);
  return getSearch({
    songs: joinedSongs,
    favList,
    playlistData: await playlistData.getContinuation(),
    page: page - 1,
  });
};

export const ytbiSearchRefresh = async (
  v: NoxMedia.Playlist,
): Promise<NoxMedia.Playlist> => {
  const result = await getSearch({
    songs: [],
    playlistData: v.refreshToken,
    page: 1,
  });
  return {
    ...v,
    songList: result.songs.concat(v.songList),
    refreshToken: result.playlistData,
  };
};

export const fetchYtbiSearch = async (
  searchVal: string,
  favList: string[] = [],
): Promise<SearchResult> => {
  try {
    const yt = await ytwebClient();
    return getSearch({
      songs: [],
      favList,
      playlistData: await yt.search(searchVal, { type: 'video' }),
      page: 2,
    });
  } catch (e) {
    logger.error(`[Ytbi.js Search] search ${searchVal} failed!`);
    console.error(e);
    return { songs: [] };
  }
};
