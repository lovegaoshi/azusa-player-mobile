import { StateCreator } from 'zustand';

import { dummyPlaylist, dummyPlaylistList } from '../objects/Playlist';
import {
  delPlaylist,
  saveFavPlaylist,
  savePlaylistIds,
  savelastPlaylistId,
} from '@utils/ChromeStorage';
import { StorageKeys } from '@enums/Storage';
import { getABRepeat } from '@utils/db/sqlAPI';
import { setPlayingList } from '@stores/playingList';
import { savePlaylist } from '../utils/db/sqlStorage';

export interface PlaylistsStore {
  /**
   * currentPlayingId is the current playing song's id/cid. used to highlight
   * what is current playing in the playlist view.
   */
  currentPlayingId: string | null;
  setCurrentPlayingId: (val: string) => Promise<void>;
  /**
   * currentPlayingList is a copied playlist of what's currently playing.
   * its not a reference to existing playlists because sometimes the playing queue
   * is different than the current playing list.
   */
  currentPlayingList: NoxMedia.Playlist;
  _setCurrentPlayingList: (
    val: NoxMedia.Playlist,
    shuffle?: (v: NoxMedia.Song[]) => NoxMedia.Song[],
  ) => boolean;
  playlists: { [key: string]: NoxMedia.Playlist };
  playlistIds: string[];
  setPlaylistIds: (val: string[]) => void;

  /**
   * this is the current Playlist selected in the playlist view. it probably should be a string
   * here but it is a reference to the actual playlist object for convenience.
   */
  currentPlaylist: NoxMedia.Playlist;
  setCurrentPlaylist: (val: NoxMedia.Playlist) => void;
  searchPlaylist: NoxMedia.Playlist;
  setSearchPlaylist: (val: NoxMedia.Playlist) => void;
  favoritePlaylist: NoxMedia.Playlist;
  setFavoritePlaylist: (val: NoxMedia.Playlist) => void;
  addPlaylist: (val: NoxMedia.Playlist) => void;
  removePlaylist: (val: string) => void;
}

const store: StateCreator<PlaylistsStore, [], [], PlaylistsStore> = (
  set,
  get,
) => ({
  currentPlayingId: '',
  setCurrentPlayingId: async val => {
    const currentABRepeat = await getABRepeat(val);
    set(v => {
      savelastPlaylistId([v.currentPlayingList.id, val]);
      return { currentPlayingId: val, currentABRepeat };
    });
  },
  currentPlayingList: dummyPlaylistList,
  _setCurrentPlayingList: (val, shuffle) => {
    const { currentPlayingList, currentPlayingId } = get();
    if (val.songList === currentPlayingList.songList) {
      return false;
    }
    set({ currentPlayingList: val });
    savelastPlaylistId([val.id, String(currentPlayingId)]);
    setPlayingList(val.songList, shuffle);
    return true;
  },
  playlists: {},
  playlistIds: [],
  setPlaylistIds: val => {
    set({ playlistIds: val });
    savePlaylistIds(val);
  },

  currentPlaylist: dummyPlaylist(),
  setCurrentPlaylist: val => set({ currentPlaylist: val }),
  searchPlaylist: dummyPlaylist(),
  setSearchPlaylist: val => {
    const { playlists } = get();
    playlists[StorageKeys.SEARCH_PLAYLIST_KEY] = val;
    set({ searchPlaylist: val, playlists });
  },
  favoritePlaylist: dummyPlaylist(),
  setFavoritePlaylist: val => {
    const { playlists } = get();
    playlists[StorageKeys.FAVORITE_PLAYLIST_KEY] = val;
    saveFavPlaylist(val);
    set({ favoritePlaylist: val, playlists });
  },

  addPlaylist: async playlist => {
    const { playlistIds, playlists } = get();
    const newPlaylistIds = playlistIds.concat(playlist.id);
    set({
      playlists: { ...playlists, [playlist.id]: playlist },
      playlistIds: newPlaylistIds,
    });
    savePlaylist(playlist);
    savePlaylistIds(newPlaylistIds);
  },
  removePlaylist: playlistId => {
    const { playlistIds, playlists, currentPlaylist } = get();
    if (currentPlaylist.id === playlistId) {
      set({ currentPlaylist: playlists[StorageKeys.SEARCH_PLAYLIST_KEY] });
    }
    delPlaylist(playlistId, playlistIds);
    const { [playlistId]: _, ...newPlaylist } = playlists;
    set({
      playlists: newPlaylist,
      playlistIds: playlistIds.filter(v => v !== playlistId),
    });
  },
});

export default store;
