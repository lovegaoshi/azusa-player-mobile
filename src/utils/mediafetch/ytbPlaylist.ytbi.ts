import { PlaylistVideo } from 'youtubei.js/dist/src/parser/nodes';
import { Playlist } from 'youtubei.js/dist/src/parser/youtube';

import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';
import { ytwebClient } from '@utils/mediafetch/ytbi';
import { fetchYtbiPlaylist as fetchYtmPlaylist } from './ytmPlaylist.ytbi';

export const ytbiPlaylistItemToNoxSong = (
  val: PlaylistVideo,
  data: Playlist,
) => {
  try {
    return SongTS({
      cid: `${Source.ytbvideo}-${val.id}`,
      bvid: val.id,
      name: val.title.text ?? 'N/A',
      nameRaw: val.title.text ?? 'N/A',
      singer: val.author.name,
      singerId: val.author.id,
      cover: val.thumbnails[0].url,
      lyric: '',
      page: 1,
      duration: val.duration.seconds,
      album: data.info.title,
      source: Source.ytbvideo,
      metadataOnLoad: true,
    });
  } catch {
    console.error(`[ytbiPlaylistParse] fail: ${JSON.stringify(val)}`);
  }
};

const getYtbSong = async (
  playlistData: Playlist,
  songs: NoxMedia.Song[],
  favList: string[],
  limit = Infinity,
  getall = false,
) => {
  const videos = playlistData.videos as PlaylistVideo[];
  for (const video of videos) {
    if (!favList.includes(video.id)) {
      const song = ytbiPlaylistItemToNoxSong(video, playlistData);
      if (song) {
        songs.push(song);
      }
    } else if (!getall) {
      return songs;
    }
  }
  if (limit > songs.length && playlistData.has_continuation) {
    return getYtbSong(await playlistData.getContinuation(), songs, favList);
  }
  return songs;
};

interface IFetchYtbiPlaylist {
  playlistId: string;
  favList?: string[];
  limit?: number;
  getall?: boolean;
}
export const fetchYtbiPlaylist = async ({
  playlistId,
  favList = [],
  limit = Infinity,
  getall = false,
}: IFetchYtbiPlaylist): Promise<NoxMedia.Song[]> => {
  const yt = await ytwebClient();
  try {
    return getYtbSong(
      await yt.getPlaylist(playlistId),
      [],
      favList,
      limit,
      getall,
    );
  } catch {
    return [];
  }
};

export const fetchPlaylist = async (
  playlistId: string,
  favList: string[] = [],
): Promise<NoxMedia.Song[]> =>
  fetchYtmPlaylist(playlistId, favList).catch(() =>
    fetchYtbiPlaylist({ playlistId, favList }),
  );
