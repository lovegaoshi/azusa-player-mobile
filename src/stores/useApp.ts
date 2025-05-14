/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { create } from 'zustand';

import { updatePlaylistSongs } from '../utils/playlistOperations';
import { saveSettings } from '@utils/ChromeStorage';
import { getPlaylist } from '@utils/db/sqlAPI';
import { StorageKeys } from '@enums/Storage';
import { DefaultSetting } from '@objects/Storage';
import { savePlayerStyle } from '@utils/StyleStorage';
import { getABRepeat } from '@utils/db/sqlAPI';
import { setPlayingList, setPlayingIndex } from '@stores/playingList';
import createAPMUI, { APMUIStore } from './useAPMUI';
import createUI, { UIStore } from './useUI';
import createPlaylists, { PlaylistsStore } from './usePlaylists';
import createMFsdk, { MFsdkStore } from './useMFsdk';
import createAPMPlayback, { APMPlaybackStore } from './useAPMPlayback';
import { initMFsdk } from '@utils/mfsdk';
import { shuffle } from '@utils/Utils';
import { smartShuffle } from '../utils/shuffle';
import { savePlaylist } from '../utils/db/sqlStorage';

interface NoxSetting
  extends APMUIStore,
    UIStore,
    PlaylistsStore,
    MFsdkStore,
    APMPlaybackStore {
  getPlaylist: (
    val: string,
    dVal?: NoxMedia.Playlist,
  ) => Promise<NoxMedia.Playlist>;
  /**
   * updates a playlist with songs added and removed, and saves it. addSongs are added at the front.
   * manipulate val before this function to add songs in whatever order desired.
   * note this function does mutate playlist.
   */
  updatePlaylist: (
    playlist: NoxMedia.Playlist,
    addSongs?: NoxMedia.Song[],
    removeSongs?: NoxMedia.Song[],
  ) => NoxMedia.Playlist;

  setCurrentPlayingList: (val: NoxMedia.Playlist) => boolean;

  playerSetting: NoxStorage.PlayerSettingDict;
  setPlayerSetting: (
    val: Partial<NoxStorage.PlayerSettingDict>,
  ) => Promise<void>;

  externalSearchText: string;
  setExternalSearchText: (val: string) => void;

  initPlayer: (
    val: NoxStorage.PlayerStorageObject,
  ) => Promise<NoxStorage.initializedResults>;
}

/**
 * store manager of noxplayer. exposes state setter and getter functions,
 * as well as saving and loading states to/from asyncStorage.
 */
export const useNoxSetting = create<NoxSetting>((set, get, storeApi) => ({
  ...createAPMUI(set, get, storeApi),
  ...createUI(set, get, storeApi),
  ...createPlaylists(set, get, storeApi),
  ...createMFsdk(set, get, storeApi),
  ...createAPMPlayback(set, get, storeApi),
  setCurrentPlayingList: (val: NoxMedia.Playlist) => {
    const { _setCurrentPlayingList, playerSetting } = get();
    return _setCurrentPlayingList(
      val,
      playerSetting.smartShuffle ? smartShuffle : shuffle,
    );
  },
  getPlaylist: async (v, d) => {
    const {
      searchPlaylist,
      favoritePlaylist,
      playlists,
      playerSetting,
      currentPlaylist,
    } = get();
    const _getPlaylist = () => {
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
    };
    return _getPlaylist() ?? d ?? searchPlaylist;
  },

  playerSetting: DefaultSetting,
  setPlayerSetting: val => {
    const newPlayerSetting = {
      ...get().playerSetting,
      ...val,
    } as NoxStorage.PlayerSettingDict;
    set({ playerSetting: newPlayerSetting });
    return saveSettings(newPlayerSetting);
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
      MFsdks: await initMFsdk(),
      currentPlayingId: val.lastPlaylistId[1],
      currentABRepeat: await getABRepeat(val.lastPlaylistId[1]),
      currentPlayingList: playingList,
      currentPlaylist: playingList,
      searchPlaylist: val.searchPlaylist,
      favoritePlaylist: val.favoriPlaylist,
      playerSetting: initializedPlayerSetting,
      playlists: val.playlists,
      playlistIds: val.playlistIds,
      playerStyle: savePlayerStyle(val.skin, false),
      playerStyles: val.skins,
      searchOption: val.defaultSearchOptions,
    });
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

export default useNoxSetting;
