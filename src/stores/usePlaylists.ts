import { StateCreator } from 'zustand';

import { dummyPlaylist, dummyPlaylistList } from '../objects/Playlist';
import { savePlaylist } from '@utils/ChromeStorageAPI';
import {
  delPlaylist,
  saveFavPlaylist,
  savePlaylistIds,
  savelastPlaylistId,
} from '@utils/ChromeStorage';
import { StorageKeys } from '@enums/Storage';
import { getABRepeatRaw } from './appStore';
import { setPlayingList } from '@stores/playingList';

export interface PlaylistsStore {
  /**
   * currentPlayingId is the current playing song's id/cid. used to highlight
   * what is current playing in the playlist view.
   */
  currentPlayingId: string | null;
  setCurrentPlayingId: (val: string) => void;
  /**
   * currentPlayingList is a copied playlist of what's currently playing.
   * its not a reference to existing playlists because sometimes the playing queue
   * is different than the current playing list.
   */
  currentPlayingList: NoxMedia.Playlist;
  setCurrentPlayingList: (val: NoxMedia.Playlist) => boolean;
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
  setCurrentPlayingId: val => {
    set(v => {
      savelastPlaylistId([v.currentPlayingList.id, val]);
      return { currentPlayingId: val, currentABRepeat: getABRepeatRaw(val) };
    });
  },
  currentPlayingList: dummyPlaylistList,
  setCurrentPlayingList: val => {
    const { currentPlayingList, currentPlayingId } = get();
    if (val.songList === currentPlayingList.songList) {
      return false;
    }
    set({ currentPlayingList: val });
    savelastPlaylistId([val.id, String(currentPlayingId)]);
    setPlayingList(val.songList);
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
    const playlists = get().playlists;
    playlists[StorageKeys.SEARCH_PLAYLIST_KEY] = val;
    set({ searchPlaylist: val, playlists });
  },
  favoritePlaylist: dummyPlaylist(),
  setFavoritePlaylist: val => {
    const playlists = get().playlists;
    playlists[StorageKeys.FAVORITE_PLAYLIST_KEY] = val;
    saveFavPlaylist(val);
    set({ favoritePlaylist: val, playlists });
  },

  addPlaylist: playlist => {
    const playlistIds = Array.from(get().playlistIds);
    const playlists = get().playlists;
    playlistIds.push(playlist.id);
    playlists[playlist.id] = playlist;
    set({ playlists, playlistIds });
    savePlaylist(playlist);
    savePlaylistIds(playlistIds);
  },
  removePlaylist: playlistId => {
    const appState = get();
    let playlistIds = appState.playlistIds;
    const playlists = appState.playlists;
    const currentPlaylist = appState.currentPlaylist;
    if (currentPlaylist.id === playlistId) {
      set({ currentPlaylist: playlists[StorageKeys.SEARCH_PLAYLIST_KEY] });
    }
    delPlaylist(playlistId, playlistIds);
    delete playlists[playlistId];
    playlistIds = playlistIds.filter(v => v !== playlistId);
    set({ playlists, playlistIds });
  },
});

export default store;
