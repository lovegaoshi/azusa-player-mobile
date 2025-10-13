import { SortOptions } from '@enums/Playlist';
import { getPlaylistPlaybackCount } from './db/sqlStorage';

export const updatePlaylistSongs = (
  playlist: NoxMedia.Playlist,
  addSongs: NoxMedia.Song[] = [],
  removeSongs: NoxMedia.Song[] = [],
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

export const sortPlaylist = async (
  playlist: NoxMedia.Playlist,
  sort: SortOptions = SortOptions.PreviousOrder,
  ascend = false,
): Promise<NoxMedia.Playlist> => {
  playlist.sort = sort;
  if (sort === SortOptions.AsIs) {
    return ascend
      ? playlist
      : { ...playlist, songList: playlist.songList.toReversed() };
  }
  if (sort === SortOptions.PreviousOrder) {
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
        .toSorted((a, b) =>
          ascend ? a.order! - b.order! : b.order! - a.order!,
        ),
    };
  }
  // for any other sorting methods, first re-apply order to all songs
  const songListLength = playlist.songList.length;
  playlist.songList.forEach(
    (song, index) => (song.order = songListLength - index),
  );
  switch (sort) {
    case SortOptions.Title:
      return {
        ...playlist,
        songList: playlist.songList.toSorted((a, b) =>
          ascend
            ? a.parsedName.localeCompare(b.parsedName)
            : b.parsedName.localeCompare(a.parsedName),
        ),
      };
    case SortOptions.Artist:
      return {
        ...playlist,
        songList: playlist.songList.toSorted((a, b) =>
          ascend
            ? a.singer.localeCompare(b.singer)
            : b.singer.localeCompare(a.singer),
        ),
      };
    case SortOptions.Album:
      return {
        ...playlist,
        songList: playlist.songList.toSorted((a, b) =>
          ascend
            ? (a.album ?? '').localeCompare(b.album ?? '')
            : (b.album ?? '').localeCompare(a.album ?? ''),
        ),
      };
    case SortOptions.LastPlayed: {
      const lastPlayCount = await getPlaylistPlaybackCount(playlist);
      return {
        ...playlist,
        songList: playlist.songList.toSorted((a, b) =>
          ascend
            ? (lastPlayCount[a.id]?.lastPlayed ?? 0) -
              (lastPlayCount[b.id]?.lastPlayed ?? 0)
            : (lastPlayCount[b.id]?.lastPlayed ?? 0) -
              (lastPlayCount[a.id]?.lastPlayed ?? 0),
        ),
      };
    }
    case SortOptions.PlayCount: {
      const lastPlayCount = await getPlaylistPlaybackCount(playlist);
      return {
        ...playlist,
        songList: playlist.songList.toSorted((a, b) =>
          ascend
            ? (lastPlayCount[a.id]?.count ?? 0) -
              (lastPlayCount[b.id]?.count ?? 0)
            : (lastPlayCount[b.id]?.count ?? 0) -
              (lastPlayCount[a.id]?.count ?? 0),
        ),
      };
    }
    case SortOptions.Date:
      return {
        ...playlist,
        songList: playlist.songList.toSorted((a, b) =>
          ascend
            ? (a.addedDate ?? 0) - (b.addedDate ?? 0)
            : (b.addedDate ?? 0) - (a.addedDate ?? 0),
        ),
      };
    default:
      return playlist;
  }
};
