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

export const sortPlaylist = (
  playlist: NoxMedia.Playlist,
  sort: SORT_OPTIONS = SORT_OPTIONS.PREVIOUS_ORDER
): NoxMedia.Playlist => {
  playlist.sort = sort;
  if (SORT_OPTIONS.PREVIOUS_ORDER === sort) {
    // first get the largest order number in the songlist:
    let largestOrder = 0;
    let songsWithoutOrder = 1;
    for (const song of playlist.songList) {
      if (!song.order) {
        songsWithoutOrder += 1;
      } else if (song.order > largestOrder) {
        largestOrder = song.order;
      }
    }
    return {
      ...playlist,
      songList: playlist.songList
        // then assign an order for all songs without one;
        .map(song => {
          if (!song.order) {
            songsWithoutOrder -= 1;
            return {
              ...song,
              order: largestOrder + songsWithoutOrder,
            };
          }
          return song;
        })
        // and sort by order
        .sort((a, b) => b.order! - a.order!),
    };
  }
  // for any other sorting methods, first re-apply order to all songs
  const songListLength = playlist.songList.length;
  playlist.songList.forEach(
    (song, index) => (song.order = songListLength - index)
  );
  switch (sort) {
    case SORT_OPTIONS.TITLE:
      return {
        ...playlist,
        songList: playlist.songList.sort((a, b) =>
          a.parsedName.localeCompare(b.parsedName)
        ),
      };
    case SORT_OPTIONS.ARTIST:
      return {
        ...playlist,
        songList: playlist.songList.sort((a, b) =>
          a.singer.localeCompare(b.singer)
        ),
      };
    case SORT_OPTIONS.ALBUM:
      return {
        ...playlist,
        songList: playlist.songList.sort((a, b) =>
          (a.album ?? '').localeCompare(b.album ?? '')
        ),
      };
    default:
      return playlist;
  }
};
