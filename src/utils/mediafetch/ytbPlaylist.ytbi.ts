import { PlaylistVideo } from 'youtubei.js/dist/src/parser/nodes';
import { Playlist } from 'youtubei.js/dist/src/parser/youtube';

import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';
import { ytClientWeb } from '@utils/mediafetch/ytbi';

const ytbiPlaylistItemToNoxSong = (val: PlaylistVideo, data: Playlist) => {
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

export const fetchYtbiPlaylist = async (
  playlistId: string,
  favList: string[] = [],
): Promise<NoxMedia.Song[]> => {
  const yt = await ytClientWeb;
  const playlistData = await yt.getPlaylist(playlistId);
  const videos = playlistData.videos as PlaylistVideo[];
  return videos
    .map(val =>
      !favList.includes(val.id)
        ? ytbiPlaylistItemToNoxSong(val, playlistData)
        : [],
    )
    .filter((val): val is NoxMedia.Song => val !== undefined);
};
