import { v4 as uuidv4 } from 'uuid';

import { PLAYLIST_ENUMS } from '../enums/Playlist';

export const dummyPlaylist = (
  title = 'Search',
  type = PLAYLIST_ENUMS.TYPE_TYPICA_PLAYLIST
): NoxMedia.Playlist => {
  return {
    songList: [],
    title,
    id: uuidv4(),
    subscribeUrl: [],
    blacklistedUrl: [],
    useBiliShazam: false,
    lastSubscribed: 0,
    type,
    biliSync: false,
    newSongOverwrite: false,
  };
};

export const dummyPlaylistList = dummyPlaylist();

export const getPlaylistUniqBVIDs = (playlist: NoxMedia.Playlist) => {
  return Array.from(
    playlist.songList.reduce(
      (accumulator, currentValue) => accumulator.add(currentValue.bvid),
      new Set() as Set<string>
    )
  );
};

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
