import {
  MusicResponsiveHeader,
  MusicResponsiveListItem,
} from 'youtubei.js/dist/src/parser/nodes';
import { Playlist } from 'youtubei.js/dist/src/parser/ytmusic';

import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';
import { ytwebClient } from '@utils/mediafetch/ytbi';

const ytbiPlaylistItemToNoxSong = (
  val: MusicResponsiveListItem,
  data: Playlist,
) => {
  try {
    const header = data.header as MusicResponsiveHeader;
    return SongTS({
      cid: `${Source.ytbvideo}-${val.id}`,
      bvid: val.id!,
      name: val.title ?? 'N/A',
      nameRaw: val.title ?? 'N/A',
      singer: val.artists?.[0]?.name ?? 'N/A',
      singerId: val.artists?.[0]?.channel_id ?? 'N/A',
      cover: val.thumbnail?.contents?.[0]?.url ?? val.thumbnails[0].url,
      lyric: '',
      page: 1,
      duration: val.duration?.seconds ?? 0,
      album: header?.subtitle.text ?? header?.title.text ?? '',
      source: Source.ytbvideo,
      metadataOnLoad: true,
    });
  } catch (e) {
    console.error(`[ytbiPlaylistParse] fail: ${e}, ${JSON.stringify(val)}`);
  }
};

const getYtbSong = async (
  playlistData: Playlist,
  songs: NoxMedia.Song[],
  favList: string[],
) => {
  const videos = (playlistData.contents?.filter(
    v => v.type === 'MusicResponsiveListItem',
  ) ?? []) as MusicResponsiveListItem[];
  for (const video of videos) {
    if (!favList.includes(video.id!)) {
      const song = ytbiPlaylistItemToNoxSong(video, playlistData);
      if (song) {
        songs.push(song);
      }
    } else {
      return songs;
    }
  }
  if (playlistData.has_continuation) {
    return getYtbSong(await playlistData.getContinuation(), songs, favList);
  }
  return songs;
};

export const fetchYtbiPlaylist = async (
  playlistId: string,
  favList: string[] = [],
): Promise<NoxMedia.Song[]> => {
  const yt = await ytwebClient();
  return getYtbSong(await yt.music.getPlaylist(playlistId), [], favList);
};
