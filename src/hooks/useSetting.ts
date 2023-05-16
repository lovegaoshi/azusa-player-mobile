/* eslint-disable prefer-const */
import { create } from 'zustand';
import Playlist, { dummyPlaylist, dummyPlaylistList } from '../objects/Playlist';
import { NoxRepeatMode } from '../components/player/enums/repeatMode';
import {
  DEFAULT_SETTING,
  PlayerStorageObject,
  STORAGE_KEYS,
  delPlaylist,
  saveFavPlaylist,
  savePlaylist,
  savePlaylistIds,
  PlayerSettingDict,
  saveSettings,
  savelastPlaylistId,
  savePlayerSkin,
} from '../utils/ChromeStorage';
import { notNullDefault } from '../utils/Utils';
import Song from '../objects/SongInterface';
import coordinates from '../objects/Coordinate';
import { createStyle } from '../components/style';
import style from '../components/styles/styleInterface';

interface NoxSetting {
  playerStyle: any;
  setPlayerStyle: (style: any) => void;

  searchBarProgress: number;
  searchBarProgressEmitter: (val: number) => undefined;

  songMenuCoords: coordinates;
  setSongMenuCoords: (val: coordinates) => void;
  songMenuVisible: boolean;
  setSongMenuVisible: (val: boolean) => void;
  songMenuSongIndexes: Array<number>;
  setSongMenuSongIndexes: (val: Array<number>) => void;
  // HACK: i'm out of my wits but heres what i got to force rerender playlist...
  playlistShouldReRender: boolean;
  togglePlaylistShouldReRender: () => void;

  currentPlayingId: string | null;
  setCurrentPlayingId: (val: string) => void;
  currentPlayingList: Playlist;
  setCurrentPlayingList: (val: Playlist) => void;
  playlists: { [key: string]: Playlist };
  playlistIds: Array<string>;
  setPlaylistIds: (val: Array<string>) => void;

  // TODO: maybe this should be a string instead...
  currentPlaylist: Playlist;
  setCurrentPlaylist: (val: Playlist) => void;
  searchPlaylist: Playlist;
  setSearchPlaylist: (val: Playlist) => void;
  favoritePlaylist: Playlist;
  setFavoritePlaylist: (val: Playlist) => void;

  playerRepeat: string;
  setPlayerRepeat: (val: string) => void;
  playerSetting: PlayerSettingDict;
  setPlayerSetting: (val: PlayerSettingDict) => void;

  addPlaylist: (val: Playlist) => void;
  removePlaylist: (val: string) => void;
  /**
   * updates a playlist with songs added and removed, and saves it. addSongs are padded to the bottom.
   * manipulate val before this function to add songs in whatever order desired.
   * note this function does mutate playlist.
   * @param val
   * @param addSongs
   * @param removeSongs
   * @returns
   */
  updatePlaylist: (
    val: Playlist,
    addSongs: Array<Song>,
    removeSongs: Array<Song>
  ) => void;

  initPlayer: (val: PlayerStorageObject) => Promise<void>;
}

/**
 * store manager of noxplayer. exposes state setter and getter functions,
 * as well as saving and loading states to/from asyncStorage.
 */
export const useNoxSetting = create<NoxSetting>((set, get) => ({
  playerStyle: createStyle(),
  setPlayerStyle: (val: style) => {
    savePlayerSkin(val);
    set({ playerStyle: createStyle(val) });
  },

  searchBarProgress: 0,
  searchBarProgressEmitter: (val: number) => {
    set({ searchBarProgress: val / 100 });
    return void 0;
  },
  songMenuCoords: { x: 0, y: 0 },
  setSongMenuCoords: (val: coordinates) => set({ songMenuCoords: val }),
  songMenuVisible: false,
  setSongMenuVisible: (val: boolean) => set({ songMenuVisible: val }),
  songMenuSongIndexes: [],
  setSongMenuSongIndexes: (val: Array<number>) =>
    set({ songMenuSongIndexes: val }),
  playlistShouldReRender: false,
  togglePlaylistShouldReRender: () =>
    set({ playlistShouldReRender: !get().playlistShouldReRender }),

  currentPlayingId: '',
  // MOCK: is it slow? GeT a BeTtEr PhOnE
  setCurrentPlayingId: (val: string) => {
    set({ currentPlayingId: val });
    savelastPlaylistId([get().currentPlayingList.id, val]);
  },
  currentPlayingList: dummyPlaylistList,
  setCurrentPlayingList: (val: Playlist) => {
    set({ currentPlayingList: val });
    savelastPlaylistId([val.id, String(get().currentPlayingId)]);
  },
  playlists: {},
  playlistIds: [],
  setPlaylistIds: (val: Array<string>) => set({ playlistIds: val }),

  currentPlaylist: dummyPlaylist(),
  setCurrentPlaylist: (val: Playlist) => set({ currentPlaylist: val }),
  searchPlaylist: dummyPlaylist(),
  setSearchPlaylist: (val: Playlist) => {
    let playlists = get().playlists;
    playlists[STORAGE_KEYS.SEARCH_PLAYLIST_KEY] = val;
    set({ searchPlaylist: val, playlists });
  },
  favoritePlaylist: dummyPlaylist(),
  setFavoritePlaylist: (val: Playlist) => {
    let playlists = get().playlists;
    playlists[STORAGE_KEYS.FAVORITE_PLAYLIST_KEY] = val;
    saveFavPlaylist(val);
    set({ favoritePlaylist: val, playlists });
  },

  playerRepeat: NoxRepeatMode.SHUFFLE,
  setPlayerRepeat: (val: string) => set({ playerRepeat: val }),
  playerSetting: DEFAULT_SETTING,
  setPlayerSetting: (val: PlayerSettingDict) => {
    set({ playerSetting: val });
    saveSettings(val);
  },

  addPlaylist: (playlist: Playlist) => {
    let playlistIds = get().playlistIds;
    let playlists = get().playlists;
    playlistIds.push(playlist.id);
    playlists[playlist.id] = playlist;
    set({ playlists, playlistIds });
    savePlaylist(playlist);
    savePlaylistIds(playlistIds);
  },
  removePlaylist: (playlistId: string) => {
    let playlistIds = get().playlistIds;
    let playlists = get().playlists;
    const currentPlaylist = get().currentPlaylist;
    if (currentPlaylist.id === playlistId) {
      set({ currentPlaylist: playlists[STORAGE_KEYS.SEARCH_PLAYLIST_KEY] });
    }
    delPlaylist(playlists[playlistId], playlistIds).then(() => {
      delete playlists[playlistId];
      playlistIds = playlistIds.filter(v => v !== playlistId);
      set({ playlists, playlistIds });
    });
  },

  updatePlaylist: (
    playlist: Playlist,
    addSongs: Array<Song> = [],
    removeSongs: Array<Song> = []
  ) => {
    let playlists = get().playlists;
    const currentPlaylist = get().currentPlaylist;
    const playlistSongsId = playlist.songList.map(v => v.id);
    const removeSongsId = removeSongs.map(v => v.id);
    // FI"FO".
    playlist.songList = addSongs
      .filter(v => !playlistSongsId.includes(v.id))
      .concat(playlist.songList)
      .filter(v => !removeSongsId.includes(v.id));
    playlists[playlist.id] = playlist;
    if (playlist.id === currentPlaylist.id) {
      set({ currentPlaylist: playlist });
    }
    set({ playlists });
    savePlaylist(playlist);
    set({ playlistShouldReRender: !get().playlistShouldReRender });
  },

  initPlayer: async (val: PlayerStorageObject) => {
    set({ currentPlayingId: val.lastPlaylistId[1] });
    set({ currentPlayingList: val.playlists[val.lastPlaylistId[0]] });
    set({
      currentPlaylist: notNullDefault(
        val.playlists[val.lastPlaylistId[0]],
        val.searchPlaylist
      ),
    });
    set({ searchPlaylist: val.searchPlaylist });
    set({ favoritePlaylist: val.favoriPlaylist });
    set({ playerSetting: val.settings ? val.settings : DEFAULT_SETTING });
    set({ playerRepeat: val.playerRepeat });
    set({ playlists: val.playlists });
    set({ playlistIds: val.playlistIds });
    set({ playerStyle: createStyle(val.skin) });
  },
}));
