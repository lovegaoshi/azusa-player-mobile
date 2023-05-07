import AsyncStorage from '@react-native-async-storage/async-storage';
import { strToU8, strFromU8, compressSync, decompressSync } from 'fflate';
import Playlist, { dummyPlaylist, PLAYLIST_ENUMS } from '../objects/Playlist';
import { notNullDefault } from './Utils';
import { NoxRepeatMode } from '../components/player/enums/repeatMode';
import Song from '../objects/SongInterface';
/**
 * noxplayer's storage handler.
 * ChromeStorage has quite a few changes from azusa player the chrome extension;
 * mainly to abandon the storageCtxMgr context and use zustand instead. 
 * if i'm getting rid of storageCtxMgr there is
 * no point migrating noxplayer storage.js.
 *
 * I will try to make noxplayer's settings compatible but some fields eg. Song.duration
 * are missing.
 */

// see known storage limits: 
// https://react-native-async-storage.github.io/async-storage/docs/limits
const MAX_SONGLIST_SIZE = 400;

export enum STORAGE_KEYS {
  PLAYER_SETTING_KEY = 'PlayerSetting',
  FAVORITE_PLAYLIST_KEY = 'FavFavList-Special',
  SEARCH_PLAYLIST_KEY = 'SearchPlaylist-Special',
  LAST_PLAY_LIST = 'LastPlayList',
  FAVLIST_AUTO_UPDATE_TIMESTAMP = 'favListAutoUpdateTimestamp',
  MY_FAV_LIST_KEY = 'MyFavList',
  PLAYMODE_KEY = 'Playmode',
}

export enum EXPORT_OPTIONS {
  LOCAL = '本地',
  DROPBOX = 'Dropbox',
  PERSONAL = '私有云',
}

export interface PlayerSettingDict {
  autoRSSUpdate: boolean;
  skin: string;
  parseSongName: boolean;
  keepSearchedSongListWhenPlaying: boolean;
  settingExportLocation: string;
  personalCloudIP: string;
  noxVersion: string;
  hideCoverInMobile: boolean;
  loadPlaylistAsArtist: boolean;
  sendBiliHeartbeat: boolean;
  noCookieBiliSearch: boolean;
  [key: string]: any;
}

export interface PlayerStorageObject {
  settings: PlayerSettingDict;
  playlistIds: Array<string>;
  playlists: { [key: string]: Playlist };
  lastPlaylistId: [string, string];
  searchPlaylist: Playlist;
  favoriPlaylist: Playlist;
  playerRepeat: string;
}

export const DEFAULT_SETTING: PlayerSettingDict = {
  autoRSSUpdate: false,
  skin: '诺莺nox',
  parseSongName: false,
  keepSearchedSongListWhenPlaying: false,
  settingExportLocation: EXPORT_OPTIONS.LOCAL,
  personalCloudIP: '',
  noxVersion: 'latest',
  hideCoverInMobile: false,
  loadPlaylistAsArtist: false,
  sendBiliHeartbeat: false,
  noCookieBiliSearch: false,
  playerRepeat: NoxRepeatMode,
};

export const saveItem = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(e);
  }
};

export const getItem = async (key: string): Promise<null | any> => {
  try {
    const retrievedStr = await AsyncStorage.getItem(key);
    return retrievedStr === null ? null : JSON.parse(retrievedStr);
  } catch (e) {
    console.error(e);
  }
  return null;
};

export const removeItem = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.warn(e);
  }
};
/**
 * splits an array to chunks of given size.
 * @param arr
 * @param size
 * @returns
 */
const chunkArray = (
  arr: Array<any>,
  size = MAX_SONGLIST_SIZE
): Array<any[]> => {
  return arr.reduce((chunks, item, index) => {
    const chunkIndex = Math.floor(index / size);
    if (!chunks[chunkIndex]) {
      chunks[chunkIndex] = [];
    }
    chunks[chunkIndex].push(item);
    return chunks;
  }, []);
};

/**
 * see known storage limits:
 * https://react-native-async-storage.github.io/async-storage/docs/limits
 * playlist can get quite large, my idea is to splice songlist into smaller lists then join them.
 * @param playlist
 * @returns
 */
export const savePlaylist = async (
  playlist: Playlist,
  overrideKey: string | null = null
) => {
  try {
    // splice into chunks
    const splicedSonglists = chunkArray(playlist.songList);
    const savingPlaylist = {
      ...playlist,
      songList: splicedSonglists.map((val, index) => `${playlist.id}.${index}`),
    };
    // save chunks
    saveItem(notNullDefault(overrideKey, playlist.id), savingPlaylist);
    splicedSonglists.forEach((list, index) =>
      saveItem(savingPlaylist.songList[index], list)
    );
  } catch (e) {
    console.error(e);
  }
};

export const getPlaylist = async (key: string): Promise<null | Playlist> => {
  try {
    // eslint-disable-next-line prefer-const
    let retrievedPlaylist = await getItem(key);
    if (retrievedPlaylist === null) return null;
    retrievedPlaylist.songList = (await Promise.all(
      retrievedPlaylist.songList.map(async (val: string) => await getItem(val))
    )) as Array<Song[]>;
    retrievedPlaylist.songList = retrievedPlaylist.songList.flat();
    return retrievedPlaylist;
  } catch (e) {
    console.error(e);
  }
  return null;
};

// no point to provide getters, as states are managed by zustand.
// unlike azusaplayer which the storage context still reads localstorage, instaed
// of keeping them as states.
export const saveSettings = async (setting: PlayerSettingDict) =>
  saveItem(STORAGE_KEYS.PLAYER_SETTING_KEY, setting);

export const savePlaylistIds = async (val: string[]) =>
  saveItem(STORAGE_KEYS.MY_FAV_LIST_KEY, val);

export const addPlaylist = async (
  playlist: Playlist,
  playlistIds: Array<string>
) => {
  playlistIds.push(playlist.id);
  savePlaylist(playlist);
  savePlaylistIds(playlistIds);
  return playlistIds;
};

export const delPlaylist = async (
  playlist: Playlist,
  playlistIds: Array<string>
) => {
  playlistIds.splice(playlistIds.indexOf(playlist.id), 1);
  removeItem(playlist.id);
  [
    ...Array(Math.ceil(playlist.songList.length / MAX_SONGLIST_SIZE)).keys(),
  ].forEach(index => {
    removeItem(`${playlist.id}.${index}`);
  });
  savePlaylistIds(playlistIds);
  return playlistIds;
};

export const saveFavPlaylist = async (playlist: Playlist) =>
  savePlaylist(playlist, STORAGE_KEYS.FAVORITE_PLAYLIST_KEY);

export const savelastPlaylistId = async (val: [string, string]) =>
  saveItem(STORAGE_KEYS.LAST_PLAY_LIST, val);

export const savePlayMode = async (val: string) =>
  saveItem(STORAGE_KEYS.PLAYMODE_KEY, val);

export const initPlayerObject = async (): Promise<PlayerStorageObject> => {
  // eslint-disable-next-line prefer-const
  let playerObject = {
    settings: notNullDefault(
      await getItem(STORAGE_KEYS.PLAYER_SETTING_KEY),
      DEFAULT_SETTING
    ),
    playlistIds: notNullDefault(
      await getItem(STORAGE_KEYS.MY_FAV_LIST_KEY),
      []
    ),
    playlists: {},
    lastPlaylistId: notNullDefault(await getItem(STORAGE_KEYS.LAST_PLAY_LIST), [
      'NULL',
      'NULL',
    ]),
    searchPlaylist: dummyPlaylist(),
    favoriPlaylist: notNullDefault(
      await getItem(STORAGE_KEYS.FAVORITE_PLAYLIST_KEY),
      dummyPlaylist('Favorite', PLAYLIST_ENUMS.TYPE_FAVORI_PLAYLIST)
    ),
    playerRepeat: notNullDefault(
      await getItem(STORAGE_KEYS.PLAYMODE_KEY),
      NoxRepeatMode.SHUFFLE
    ),
  } as PlayerStorageObject;

  playerObject.playlists[STORAGE_KEYS.SEARCH_PLAYLIST_KEY] =
    playerObject.searchPlaylist;
  playerObject.playlists[STORAGE_KEYS.FAVORITE_PLAYLIST_KEY] =
    playerObject.favoriPlaylist;

  await Promise.all(
    playerObject.playlistIds.map(async id => {
      const retrievedPlaylist = await getPlaylist(id);
      if (retrievedPlaylist) playerObject.playlists[id] = retrievedPlaylist;
    })
  );
  return playerObject;
};

export const clearStorage = async () => await AsyncStorage.clear();

// gzip
export const exportPlayerContent = async () => {
  const allKeys = await AsyncStorage.getAllKeys();
  return compressSync(strToU8(JSON.stringify(allKeys)));
};

export const importPlayerContent = async (content: Uint8Array) => {
  try {
    await AsyncStorage.multiSet(JSON.parse(strFromU8(decompressSync(content))));
    return await initPlayerObject();
  } catch {
    return null;
  }
};

// gzip
export const importPlayerObjectOld = async (
  playerObject: PlayerStorageObject
) => {
  await clearStorage();
  saveSettings(playerObject.settings);
  savePlaylistIds(playerObject.playlistIds);
  savelastPlaylistId(playerObject.lastPlaylistId);
  saveFavPlaylist(playerObject.favoriPlaylist);
  Object.entries(playerObject.playlists).forEach(val => savePlaylist(val[1]));
};
