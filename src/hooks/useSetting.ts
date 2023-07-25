/* eslint-disable prefer-const */
import { create } from 'zustand';
import {
  dummyPlaylist,
  dummyPlaylistList,
  updatePlaylistSongs,
} from '../objects/Playlist';
import {
  DEFAULT_SETTING,
  STORAGE_KEYS,
  delPlaylist,
  saveFavPlaylist,
  savePlaylist,
  savePlaylistIds,
  saveSettings,
  savelastPlaylistId,
  savePlayerSkin,
  savePlayerSkins,
  saveLyricMapping,
} from '../utils/ChromeStorage';
import { createStyle } from '../components/style';
import noxPlayingList, { setPlayingList } from '../stores/playingList';
import { resolveBackgroundImage } from '../components/background/MainBackground';
import type { NoxStorage } from '../types/storage';

const { getState, setState } = noxPlayingList;

interface initializedResults {
  currentPlayingList: NoxMedia.Playlist;
  currentPlayingID: string;
  playlists: { [key: string]: NoxMedia.Playlist };
  storedPlayerSetting: NoxStorage.PlayerSettingDict;
  cookies: { [key: string]: string };
  language?: string;
  lastPlayDuration: number;
}

interface NoxSetting {
  playerStyle: any;
  setPlayerStyle: (style: any) => void;
  playerStyles: any[];
  setPlayerStyles: (val: any[]) => void;

  searchBarProgress: number;
  searchBarProgressEmitter: (val: number) => undefined;

  songMenuCoords: NoxTheme.coordinates;
  setSongMenuCoords: (val: NoxTheme.coordinates) => void;
  songMenuVisible: boolean;
  setSongMenuVisible: (val: boolean) => void;
  songMenuSongIndexes: Array<number>;
  setSongMenuSongIndexes: (val: Array<number>) => void;
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
  playlistIds: Array<string>;
  setPlaylistIds: (val: Array<string>) => void;

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

  playerSetting: NoxStorage.PlayerSettingDict;
  setPlayerSetting: (val: Partial<NoxStorage.PlayerSettingDict>) => void;

  addPlaylist: (val: NoxMedia.Playlist) => void;
  removePlaylist: (val: string) => void;

  lyricMapping: Map<string, NoxMedia.LyricDetail>;
  setLyricMapping: (val: NoxMedia.LyricDetail) => void;

  externalSearchText: string;
  setExternalSearchText: (val: string) => void;

  /**
   * updates a playlist with songs added and removed, and saves it. addSongs are added at the front.
   * manipulate val before this function to add songs in whatever order desired.
   * note this function does mutate playlist.
   * @param val playlist
   * @param addSongs songs to be added at the front.
   * @param removeSongs songs to be deleted
   * @returns
   */
  updatePlaylist: (
    val: NoxMedia.Playlist,
    addSongs: Array<NoxMedia.Song>,
    removeSongs: Array<NoxMedia.Song>
  ) => NoxMedia.Playlist;

  initPlayer: (
    val: NoxStorage.PlayerStorageObject
  ) => Promise<initializedResults>;
}

/**
 * store manager of noxplayer. exposes state setter and getter functions,
 * as well as saving and loading states to/from asyncStorage.
 */
export const useNoxSetting = create<NoxSetting>((set, get) => ({
  playerStyle: createStyle(),
  setPlayerStyle: (val: NoxTheme.style) => {
    const createdStyle = createStyle(val);
    resolveBackgroundImage(createdStyle.bkgrdImg).then(resolvedBackground =>
      set({
        playerStyle: {
          ...createdStyle,
          bkgrdImg: resolvedBackground,
        },
      })
    );
    savePlayerSkin(val);
  },
  playerStyles: [],
  setPlayerStyles: (val: any[]) => {
    set({ playerStyles: val });
    savePlayerSkins(val);
  },

  searchBarProgress: 0,
  searchBarProgressEmitter: (val: number) => {
    set({ searchBarProgress: val / 100 });
    return undefined;
  },
  songMenuCoords: { x: 0, y: 0 },
  setSongMenuCoords: (val: NoxTheme.coordinates) =>
    set({ songMenuCoords: val }),
  songMenuVisible: false,
  setSongMenuVisible: (val: boolean) => set({ songMenuVisible: val }),
  songMenuSongIndexes: [],
  setSongMenuSongIndexes: (val: Array<number>) =>
    set({ songMenuSongIndexes: val }),
  playlistShouldReRender: false,
  togglePlaylistShouldReRender: () =>
    set(state => ({ playlistShouldReRender: state.playlistShouldReRender })),

  currentPlayingId: '',
  // MOCK: is it slow? GeT a BeTtEr PhOnE
  setCurrentPlayingId: (val: string) => {
    set({ currentPlayingId: val });
    savelastPlaylistId([get().currentPlayingList.id, val]);
  },
  currentPlayingList: dummyPlaylistList,
  setCurrentPlayingList: (val: NoxMedia.Playlist) => {
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
  setPlaylistIds: (val: Array<string>) => {
    set({ playlistIds: val });
    savePlaylistIds(val);
  },

  currentPlaylist: dummyPlaylist(),
  setCurrentPlaylist: (val: NoxMedia.Playlist) => set({ currentPlaylist: val }),
  searchPlaylist: dummyPlaylist(),
  setSearchPlaylist: (val: NoxMedia.Playlist) => {
    let playlists = get().playlists;
    playlists[STORAGE_KEYS.SEARCH_PLAYLIST_KEY] = val;
    set({ searchPlaylist: val, playlists });
  },
  favoritePlaylist: dummyPlaylist(),
  setFavoritePlaylist: (val: NoxMedia.Playlist) => {
    let playlists = get().playlists;
    playlists[STORAGE_KEYS.FAVORITE_PLAYLIST_KEY] = val;
    saveFavPlaylist(val);
    set({ favoritePlaylist: val, playlists });
  },

  playerSetting: DEFAULT_SETTING,
  setPlayerSetting: (val: Partial<NoxStorage.PlayerSettingDict>) => {
    const newPlayerSetting = { ...get().playerSetting, ...val };
    set({ playerSetting: newPlayerSetting });
    saveSettings(newPlayerSetting);
  },

  addPlaylist: (playlist: NoxMedia.Playlist) => {
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
    playlist: NoxMedia.Playlist,
    addSongs: Array<NoxMedia.Song> = [],
    removeSongs: Array<NoxMedia.Song> = []
  ) => {
    let playlists = get().playlists;
    const currentPlaylist = get().currentPlaylist;
    updatePlaylistSongs(playlist, addSongs, removeSongs);
    playlists[playlist.id] = playlist;
    if (playlist.id === currentPlaylist.id) {
      set({ currentPlaylist: playlist });
    }
    set({ playlists });
    savePlaylist(playlist);
    set({ playlistShouldReRender: !get().playlistShouldReRender });
    return playlist;
  },

  lyricMapping: new Map<string, NoxMedia.LyricDetail>(),
  setLyricMapping: (val: NoxMedia.LyricDetail) => {
    let lyricMapping = get().lyricMapping;
    lyricMapping.set(val.songId, val);
    set({ lyricMapping });
    saveLyricMapping(lyricMapping);
  },

  externalSearchText: '',
  setExternalSearchText: (val: string) => {
    set({ externalSearchText: val });
  },

  initPlayer: async (val: NoxStorage.PlayerStorageObject) => {
    const playingList =
      val.playlists[val.lastPlaylistId[0]] || dummyPlaylistList;
    const createdStyle = createStyle(val.skin);
    set({ currentPlayingId: val.lastPlaylistId[1] });
    set({ currentPlayingList: playingList });
    set({
      currentPlaylist:
        val.playlists[val.lastPlaylistId[0]] || val.searchPlaylist,
    });
    set({ searchPlaylist: val.searchPlaylist });
    set({ favoritePlaylist: val.favoriPlaylist });
    set({ playerSetting: val.settings || DEFAULT_SETTING });
    set({ playlists: val.playlists });
    set({ playlistIds: val.playlistIds });
    set({
      playerStyle: {
        ...createdStyle,
        bkgrdImg: await resolveBackgroundImage(createdStyle.bkgrdImg),
      },
    });
    set({ playerStyles: val.skins });
    setPlayingList(
      (val.playlists[val.lastPlaylistId[0]] || val.searchPlaylist).songList
    );
    setState({ playmode: val.playerRepeat });
    set({ lyricMapping: val.lyricMapping });
    return {
      playlists: val.playlists,
      currentPlayingList: playingList,
      currentPlayingID: val.lastPlaylistId[1],
      storedPlayerSetting: val.settings || DEFAULT_SETTING,
      cookies: val.cookies,
      language: val.settings.language,
      lastPlayDuration: val.lastPlayDuration,
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
