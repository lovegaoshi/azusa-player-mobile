import { v4 as uuidv4 } from 'uuid';
import i18n from 'i18next';

import { PlaylistTypes } from '../enums/Playlist';

export const dummyPlaylist = (
  title = i18n.t('PlaylistOperations.searchListName') ?? 'Placeholder',
  type = PlaylistTypes.Typical,
): NoxMedia.Playlist => ({
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
});

// HACK: i18n is not init at this point?
export const dummyPlaylistList = dummyPlaylist();

export const getPlaylistUniqBVIDs = (playlist: NoxMedia.Playlist) => {
  return Array.from(
    playlist.songList.reduce(
      (accumulator, currentValue) => accumulator.add(currentValue.bvid),
      new Set() as Set<string>,
    ),
  );
};
