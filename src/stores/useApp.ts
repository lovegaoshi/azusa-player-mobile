/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { create } from 'zustand';

import { dummyPlaylist, dummyPlaylistList } from '../objects/Playlist';
import { updatePlaylistSongs } from '../utils/playlistOperations';
import { savePlaylist } from '@utils/ChromeStorageAPI';
import {
  delPlaylist,
  saveFavPlaylist,
  savePlaylistIds,
  saveSettings,
  savelastPlaylistId,
  savePlayerSkins,
  saveLyricMapping,
  saveDefaultSearch,
  getPlaylist,
} from '@utils/ChromeStorage';
import { StorageKeys, SearchOptions } from '@enums/Storage';
import { DefaultSetting } from '@objects/Storage';
import { setPlayerSetting as setPlayerSettingVanilla } from './playerSettingStore';
import { savePlayerStyle } from '@utils/StyleStorage';
import { createStyle } from '@components/style';
import { getABRepeatRaw } from './appStore';
import { setPlayingList, setPlayingIndex } from '@stores/playingList';
import DummyLyricDetail from '../objects/LyricDetail';
import { MUSICFREE } from '@utils/mediafetch/musicfree';
import { IntentData } from '@enums/Intent';
import { BottomTabRouteIcons } from '@enums/BottomTab';

interface NoxSetting {
  bottomTabRoute: BottomTabRouteIcons;
  setBottomTabRoute: (val: BottomTabRouteIcons) => void;

  songListScrollCounter: number;
  incSongListScrollCounter: () => void;

  intentData?: IntentData;
  setIntentData: (val?: IntentData) => void;

  searchOption: SearchOptions | MUSICFREE;
  setSearchOption: (val: SearchOptions | MUSICFREE) => void;

  gestureMode: boolean;
  setGestureMode: (val: boolean) => void;
  // TODO: fix type
  updateTrack: (metadata: any) => void;
  setUpdateTrack: (val: () => void) => void;
  appRefresh: boolean;
  setAppRefresh: () => void;
  playlistSearchAutoFocus: boolean;
  setPlaylistSearchAutoFocus: (val: boolean) => void;
  playlistInfoUpdate: boolean;
  togglePlaylistInfoUpdate: () => void;

  currentABRepeat: [number, number];
  setCurrentABRepeat: (val: [number, number]) => void;

  playerStyle: any;
  setPlayerStyle: (style: any, save?: boolean) => void;
  playerStyles: any[];
  setPlayerStyles: (val: any[]) => void;

  searchBarProgress: number;
  searchBarProgressEmitter: (val: number) => undefined;

  songMenuCoords: NoxTheme.coordinates;
  setSongMenuCoords: (val: NoxTheme.coordinates) => void;
  songMenuVisible: boolean;
  setSongMenuVisible: (val: boolean) => void;
  songMenuSongIndexes: number[];
  setSongMenuSongIndexes: (val: number[]) => void;
  // HACK: i'm out of my wits but heres what i got to force rerender playlist...
  playlistShouldReRender: boolean;
  togglePlaylistShouldReRender: () => void;

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
  getPlaylist: (val: string) => Promise<NoxMedia.Playlist>;

  playerSetting: NoxStorage.PlayerSettingDict;
  setPlayerSetting: (
    val: Partial<NoxStorage.PlayerSettingDict>
  ) => Promise<void>;

  addPlaylist: (val: NoxMedia.Playlist) => void;
  removePlaylist: (val: string) => void;

  lyricMapping: Map<string, NoxMedia.LyricDetail>;
  setLyricMapping: (val: Partial<NoxMedia.LyricDetail>) => void;

  externalSearchText: string;
  setExternalSearchText: (val: string) => void;

  /**
   * updates a playlist with songs added and removed, and saves it. addSongs are added at the front.
   * manipulate val before this function to add songs in whatever order desired.
   * note this function does mutate playlist.
   */
  updatePlaylist: (
    playlist: NoxMedia.Playlist,
    addSongs?: NoxMedia.Song[],
    removeSongs?: NoxMedia.Song[]
  ) => NoxMedia.Playlist;

  initPlayer: (
    val: NoxStorage.PlayerStorageObject
  ) => Promise<NoxStorage.initializedResults>;
}

/**
 * store manager of noxplayer. exposes state setter and getter functions,
 * as well as saving and loading states to/from asyncStorage.
 */
export const useNoxSetting = create<NoxSetting>((set, get) => ({
  bottomTabRoute: BottomTabRouteIcons.music,
  setBottomTabRoute: val => set({ bottomTabRoute: val }),

  songListScrollCounter: 0,
  incSongListScrollCounter: () =>
    set(state => ({
      songListScrollCounter: state.songListScrollCounter + 1,
    })),

  setIntentData: intentData => set({ intentData }),

  searchOption: SearchOptions.BILIBILI,
  setSearchOption: v => {
    set({ searchOption: v });
    saveDefaultSearch(v);
  },

  gestureMode: true,
  setGestureMode: val => set({ gestureMode: val }),

  updateTrack: () => undefined,
  setUpdateTrack: updateTrack => set({ updateTrack }),

  appRefresh: false,
  setAppRefresh: () => set({ appRefresh: true }),
  playlistSearchAutoFocus: true,
  setPlaylistSearchAutoFocus: val => set({ playlistSearchAutoFocus: val }),
  playlistInfoUpdate: true,
  togglePlaylistInfoUpdate: () =>
    set(state => ({
      playlistInfoUpdate: !state.playlistInfoUpdate,
    })),

  currentABRepeat: [0, 1],
  setCurrentABRepeat: val => set({ currentABRepeat: val }),

  playerStyle: createStyle(),
  setPlayerStyle: (val, save = true) =>
    set({ playerStyle: savePlayerStyle(val, save) }),
  playerStyles: [],
  setPlayerStyles: val => {
    set({ playerStyles: val });
    savePlayerSkins(val);
  },

  searchBarProgress: 0,
  searchBarProgressEmitter: val => {
    set({ searchBarProgress: val / 100 });
    return undefined;
  },
  songMenuCoords: { x: 0, y: 0 },
  setSongMenuCoords: val => set({ songMenuCoords: val }),
  songMenuVisible: false,
  setSongMenuVisible: val => set({ songMenuVisible: val }),
  songMenuSongIndexes: [],
  setSongMenuSongIndexes: val => set({ songMenuSongIndexes: val }),
  playlistShouldReRender: false,
  togglePlaylistShouldReRender: () =>
    set(state => ({ playlistShouldReRender: !state.playlistShouldReRender })),

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
    let playlists = get().playlists;
    playlists[StorageKeys.SEARCH_PLAYLIST_KEY] = val;
    set({ searchPlaylist: val, playlists });
  },
  favoritePlaylist: dummyPlaylist(),
  setFavoritePlaylist: val => {
    let playlists = get().playlists;
    playlists[StorageKeys.FAVORITE_PLAYLIST_KEY] = val;
    saveFavPlaylist(val);
    set({ favoritePlaylist: val, playlists });
  },
  getPlaylist: async v => {
    const {
      searchPlaylist,
      favoritePlaylist,
      playlists,
      playerSetting,
      currentPlaylist,
    } = get();
    switch (v) {
      case StorageKeys.SEARCH_PLAYLIST_KEY:
        return searchPlaylist;
      case StorageKeys.FAVORITE_PLAYLIST_KEY:
        return favoritePlaylist;
      default:
        if (currentPlaylist.id === v) {
          return currentPlaylist;
        }
        if (playerSetting.memoryEfficiency) {
          return getPlaylist({ key: v });
        }
        return playlists[v];
    }
  },

  playerSetting: DefaultSetting,
  setPlayerSetting: val => {
    const newPlayerSetting = { ...get().playerSetting, ...val };
    set({ playerSetting: newPlayerSetting });
    setPlayerSettingVanilla(newPlayerSetting);
    return saveSettings(newPlayerSetting);
  },

  addPlaylist: playlist => {
    let playlistIds = Array.from(get().playlistIds);
    let playlists = get().playlists;
    playlistIds.push(playlist.id);
    playlists[playlist.id] = playlist;
    set({ playlists, playlistIds });
    savePlaylist(playlist);
    savePlaylistIds(playlistIds);
  },
  removePlaylist: playlistId => {
    const appState = get();
    let playlistIds = appState.playlistIds;
    let playlists = appState.playlists;
    const currentPlaylist = appState.currentPlaylist;
    if (currentPlaylist.id === playlistId) {
      set({ currentPlaylist: playlists[StorageKeys.SEARCH_PLAYLIST_KEY] });
    }
    delPlaylist(playlistId, playlistIds);
    delete playlists[playlistId];
    playlistIds = playlistIds.filter(v => v !== playlistId);
    set({ playlists, playlistIds });
  },

  updatePlaylist: (playlist, addSongs = [], removeSongs = []) => {
    const {
      playlists,
      playerSetting,
      currentPlaylist,
      playlistShouldReRender,
    } = get();
    updatePlaylistSongs(playlist, addSongs, removeSongs);
    playlists[playlist.id] = playerSetting.memoryEfficiency
      ? { ...playlist, songList: [] }
      : playlist;
    if (playlist.id === currentPlaylist.id) {
      set({ currentPlaylist: playlist });
    }
    set({ playlists });
    savePlaylist(playlist);
    set({ playlistShouldReRender: !playlistShouldReRender });
    return playlist;
  },

  lyricMapping: new Map<string, NoxMedia.LyricDetail>(),
  setLyricMapping: val => {
    if (!val.songId) {
      return;
    }
    const lyricMapping = get().lyricMapping;
    lyricMapping.set(val.songId, {
      ...DummyLyricDetail,
      ...lyricMapping.get(val.songId),
      ...val,
    });
    set({ lyricMapping });
    saveLyricMapping(lyricMapping);
  },

  externalSearchText: '',
  setExternalSearchText: val => {
    set({ externalSearchText: val });
  },

  initPlayer: async val => {
    const playingList = await getPlaylist({
      key: val.lastPlaylistId[0],
      defaultPlaylist: () =>
        val.lastPlaylistId[0] === val.favoriPlaylist.id
          ? val.favoriPlaylist
          : val.searchPlaylist,
    });
    const initializedPlayerSetting = val.settings;
    set({
      currentPlayingId: val.lastPlaylistId[1],
      currentABRepeat: getABRepeatRaw(val.lastPlaylistId[1]),
      currentPlayingList: playingList,
      currentPlaylist: playingList,
      searchPlaylist: val.searchPlaylist,
      favoritePlaylist: val.favoriPlaylist,
      playerSetting: initializedPlayerSetting,
      playlists: val.playlists,
      playlistIds: val.playlistIds,
      playerStyle: savePlayerStyle(val.skin, false),
      playerStyles: val.skins,
      lyricMapping: val.lyricMapping,
      searchOption: val.defaultSearchOptions,
    });
    setPlayerSettingVanilla(initializedPlayerSetting);
    setPlayingList(playingList.songList);
    setPlayingIndex(0, val.lastPlaylistId[1]);

    return {
      playlists: val.playlists,
      currentPlayingList: playingList,
      currentPlayingID: val.lastPlaylistId[1],
      storedPlayerSetting: val.settings ?? DefaultSetting,
      cookies: val.cookies,
      language: val.settings.language,
      lastPlayDuration: val.lastPlayDuration,
      playbackMode: val.playbackMode,
    };
  },

  exportLegacy: () => {
    const { playlistIds, playlists } = get();
    const exportedLegacy: {
      [key: string]: NoxMedia.Playlist | string[];
    } = {
      MyFavList: playlistIds,
    };
    for (const [key, value] of Object.entries(playlists)) {
      exportedLegacy[key] = value;
    }
    return exportedLegacy;
  },
}));
