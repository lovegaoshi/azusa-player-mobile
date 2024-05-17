/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { create } from 'zustand';

import { dummyPlaylist, dummyPlaylistList } from '../objects/Playlist';
import { updatePlaylistSongs } from '../utils/playlistOperations';
import {
  delPlaylist,
  saveFavPlaylist,
  savePlaylist,
  savePlaylistIds,
  saveSettings,
  savelastPlaylistId,
  savePlayerSkins,
  saveLyricMapping,
  saveDefaultSearch,
  getPlaylist,
} from '@utils/ChromeStorage';
import { DefaultSetting, StorageKeys, SearchOptions } from '@enums/Storage';
import { setPlayerSetting as setPlayerSettingVanilla } from './playerSettingStore';
import { savePlayerStyle } from '@utils/StyleStorage';
import { createStyle } from '@components/style';
import { getABRepeatRaw } from './appStore';
import { setPlayingList, setPlayingIndex } from '@stores/playingList';
import DummyLyricDetail from '../objects/LyricDetail';
import { MUSICFREE } from '../utils/mediafetch/musicfree';
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
  setPlayerSetting: (val: Partial<NoxStorage.PlayerSettingDict>) => void;

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
  ) => Promise<NoxMedia.Playlist>;

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
  setPlayerStyle: (val, save = true) => {
    savePlayerStyle(val, save).then(playerStyle => set({ playerStyle }));
  },
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
    set({ currentPlayingId: val });
    savelastPlaylistId([get().currentPlayingList.id, val]);
    set({ currentABRepeat: getABRepeatRaw(val) });
  },
  currentPlayingList: dummyPlaylistList,
  setCurrentPlayingList: val => {
    if (val.songList === get().currentPlayingList.songList) {
      return false;
    }
    set({ currentPlayingList: val });
    savelastPlaylistId([val.id, String(get().currentPlayingId)]);
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
    const appState: NoxSetting = get();
    switch (v) {
      case StorageKeys.SEARCH_PLAYLIST_KEY:
        return appState.searchPlaylist;
      case StorageKeys.FAVORITE_PLAYLIST_KEY:
        return appState.favoritePlaylist;
      default:
        if (appState.playerSetting.memoryEfficiency) {
          return getPlaylist({ key: v });
        }
        return appState.playlists[v];
    }
  },

  playerSetting: DefaultSetting,
  setPlayerSetting: val => {
    const newPlayerSetting = { ...get().playerSetting, ...val };
    set({ playerSetting: newPlayerSetting });
    saveSettings(newPlayerSetting);
    setPlayerSettingVanilla(newPlayerSetting);
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
    let playlistIds = get().playlistIds;
    let playlists = get().playlists;
    const currentPlaylist = get().currentPlaylist;
    if (currentPlaylist.id === playlistId) {
      set({ currentPlaylist: playlists[StorageKeys.SEARCH_PLAYLIST_KEY] });
    }
    delPlaylist(playlistId, playlistIds);
    delete playlists[playlistId];
    playlistIds = playlistIds.filter(v => v !== playlistId);
    set({ playlists, playlistIds });
  },

  updatePlaylist: async (playlist, addSongs = [], removeSongs = []) => {
    const appState: NoxSetting = get();
    let playlists = appState.playlists;
    const currentPlaylist = appState.currentPlaylist;
    const retrivedPlaylist = {
      ...playlist,
      songList: (await appState.getPlaylist(playlist.id)).songList,
    };
    updatePlaylistSongs(retrivedPlaylist, addSongs, removeSongs);
    playlists[playlist.id] = appState.playerSetting.memoryEfficiency
      ? { ...playlist, songList: [] }
      : retrivedPlaylist;
    if (playlist.id === currentPlaylist.id) {
      set({ currentPlaylist: retrivedPlaylist });
    }
    set({ playlists });
    savePlaylist(retrivedPlaylist);
    set({ playlistShouldReRender: !appState.playlistShouldReRender });
    return retrivedPlaylist;
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
          : dummyPlaylistList,
    });
    const initializedPlayerSetting = val.settings;
    set({
      currentPlayingId: val.lastPlaylistId[1],
      currentABRepeat: getABRepeatRaw(val.lastPlaylistId[1]),
      currentPlayingList: playingList,
      currentPlaylist:
        val.playlists[val.lastPlaylistId[0]] || val.searchPlaylist,
      searchPlaylist: val.searchPlaylist,
      favoritePlaylist: val.favoriPlaylist,
      playerSetting: initializedPlayerSetting,
      playlists: val.playlists,
      playlistIds: val.playlistIds,
      playerStyle: await savePlayerStyle(val.skin, false),
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
      storedPlayerSetting: val.settings || DefaultSetting,
      cookies: val.cookies,
      language: val.settings.language,
      lastPlayDuration: val.lastPlayDuration,
      playbackMode: val.playbackMode,
    };
  },

  exportLegacy: () => {
    const exportedLegacy: {
      [key: string]: NoxMedia.Playlist | string[];
    } = {
      MyFavList: get().playlistIds,
    };
    for (const [key, value] of Object.entries(get().playlists)) {
      exportedLegacy[key] = value;
    }
    return exportedLegacy;
  },
}));
