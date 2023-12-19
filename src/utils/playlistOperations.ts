import { SORT_OPTIONS } from '@enums/Playlist';

export const updatePlaylistSongs = (
  playlist: NoxMedia.Playlist,
  addSongs: Array<NoxMedia.Song> = [],
  removeSongs: Array<NoxMedia.Song> = []
) => {
  const playlistSongsId = playlist.songList.map(v => v.id);
  const removeSongsId = removeSongs.map(v => v.id);
  // FI"FO".
  playlist.songList = addSongs
    .filter(v => !playlistSongsId.includes(v.id))
    .concat(playlist.songList)
    .filter(v => !removeSongsId.includes(v.id));
  return playlist;
};
