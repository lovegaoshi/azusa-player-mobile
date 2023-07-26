import AsyncStorage from '@react-native-async-storage/async-storage';
import { strToU8, strFromU8, compressSync, decompressSync } from 'fflate';
import { Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

import { dummyPlaylist, dummyPlaylistList } from '../objects/Playlist';
import { NoxRepeatMode } from '../components/player/enums/RepeatMode';
import { PLAYLIST_ENUMS } from '../enums/Playlist';
import AzusaTheme from '../components/styles/AzusaTheme';
import { chunkArray as chunkArrayRaw } from '../utils/Utils';
import { VERSIONS } from '../enums/Version';
import { EXPORT_OPTIONS } from '../enums/Sync';
import type { NoxStorage } from '../types/storage';
import { logger } from './Logger';
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
  SKIN = 'PlayerSkin',
  SKINSTORAGE = 'PlayerSkinStorage',
  COOKIES = 'Cookies',
  LYRIC_MAPPING = 'LyricMapping',
  LAST_PLAY_DURATION = 'LastPlayDuration',
  CACHED_MEDIA_MAPPING = 'CachedMediaMapping',
}

const appID = 'NoxPlayerMobile';

export const DEFAULT_SETTING: NoxStorage.PlayerSettingDict = {
  autoRSSUpdate: true,
  skin: '诺莺nox',
  parseSongName: true,
  keepSearchedSongListWhenPlaying: false,
  settingExportLocation: EXPORT_OPTIONS.LOCAL,
  personalCloudIP: '',
  personalCloudID: 'azusamobile',
  noxVersion: VERSIONS.latest,
  noxCheckedVersion: VERSIONS.latest,

  hideCoverInMobile: false,
  loadPlaylistAsArtist: false,
  sendBiliHeartbeat: false,
  noCookieBiliSearch: false,
  playerRepeat: NoxRepeatMode.SHUFFLE,
  dataSaver: false,
  fastBiliSearch: true,
  noInterruption: false,
  updateLoadedTrack: false,

  appID,
  language: undefined,
  cacheSize: 1,
};

export const saveItem = async (key: string, value: any) => {
  try {
    console.log('saving %s %s into Map', key, value);
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

export const loadCachedMediaMapping = async () => {
  return (await getItem(STORAGE_KEYS.CACHED_MEDIA_MAPPING)) || [];
};

export const saveCachedMediaMapping = async (val: any[]) => {
  return await saveItem(STORAGE_KEYS.CACHED_MEDIA_MAPPING, val);
};

// we keep the set-cookie header for noxplayer's remove personal search option
export const addCookie = async (site: string, setHeader: string) => {
  const cookies = (await getItem(STORAGE_KEYS.COOKIES)) || {};
  saveItem(STORAGE_KEYS.COOKIES, { ...cookies, [site]: setHeader });
};

export const removeCookie = async (site: string) => {
  const cookies = (await getItem(STORAGE_KEYS.COOKIES)) || {};
  cookies[site] = [];
  saveItem(STORAGE_KEYS.COOKIES, cookies);
};

/**
 * splits an array to chunks of given size.
 * @param arr
 * @param size
 * @returns
 */
const chunkArray = <T>(arr: Array<T>, size = MAX_SONGLIST_SIZE): Array<T[]> => {
  return chunkArrayRaw(arr, size);
};

/**
 * a generic chunk splitter to store arrays that may exceed 2MB storage limits.
 * see known storage limits:
 * https://react-native-async-storage.github.io/async-storage/docs/limits
 * @param object
 * @param key
 */
const saveChucked = async (
  objects: Array<any>,
  key: string,
  saveToStorage = true
) => {
  // splice into chunks
  const chuckedObject = chunkArray(objects);
  const chuckedIndices = chuckedObject.map((val, index) => `${key}.${index}`);
  chuckedObject.forEach((list, index) => saveItem(chuckedIndices[index], list));
  if (saveToStorage) {
    saveItem(key, chuckedIndices);
    return [];
  } else {
    return chuckedIndices;
  }
};

const loadChucked = async (keys: string[]) => {
  const loadedArrays = (await Promise.all(
    keys.map(async (val: string) => await getItem(val))
  )) as Array<any[]>;
  return loadedArrays.flat();
};
/**
 * playlist can get quite large, my idea is to splice songlist into smaller lists then join them.
 * @param playlist
 * @returns
 */
export const savePlaylist = async (
  playlist: NoxMedia.Playlist,
  overrideKey: string | null = null
) => {
  try {
    const savingPlaylist = {
      ...playlist,
      songList: await saveChucked(playlist.songList, playlist.id, false),
    };
    // save chunks
    saveItem(overrideKey || playlist.id || uuidv4(), savingPlaylist);
  } catch (e) {
    console.error(e);
  }
};

/**
 * note this method always return a playlist, if error occurs a dummy one is
 * returned.
 * @param key playlist ID.
 * @returns
 */
export const getPlaylist = async (key: string): Promise<NoxMedia.Playlist> => {
  try {
    const retrievedPlaylist = await getItem(key);
    if (retrievedPlaylist === null) return dummyPlaylist();
    retrievedPlaylist.songList = await loadChucked(retrievedPlaylist.songList);
    return retrievedPlaylist;
  } catch (e) {
    console.error(e);
  }
  return dummyPlaylist();
};

export const savePlayerSkins = async (skins: Array<any>) =>
  saveChucked(skins, STORAGE_KEYS.SKINSTORAGE);

export const getPlayerSkins = async () =>
  await loadChucked((await getItem(STORAGE_KEYS.SKINSTORAGE)) || []);

export const saveLyricMapping = async (
  lyricMapping: Map<string, NoxMedia.LyricDetail>
) => saveItem(STORAGE_KEYS.LYRIC_MAPPING, lyricMapping);

export const getLyricMapping = async () =>
  await getItem(STORAGE_KEYS.LYRIC_MAPPING);

// no point to provide getters, as states are managed by zustand.
// unlike azusaplayer which the storage context still reads localstorage, instaed
// of keeping them as states.
export const saveSettings = async (setting: NoxStorage.PlayerSettingDict) =>
  saveItem(STORAGE_KEYS.PLAYER_SETTING_KEY, setting);

export const savePlaylistIds = async (val: string[]) =>
  saveItem(STORAGE_KEYS.MY_FAV_LIST_KEY, val);

export const savePlayerSkin = async (val: NoxTheme.style) =>
  saveItem(STORAGE_KEYS.SKIN, val);

export const addPlaylist = async (
  playlist: NoxMedia.Playlist,
  playlistIds: Array<string>
) => {
  playlistIds.push(playlist.id);
  savePlaylist(playlist);
  savePlaylistIds(playlistIds);
  return playlistIds;
};

const delPlaylistRaw = async (playlist: NoxMedia.Playlist) => {
  removeItem(playlist.id);
  [
    ...Array(Math.ceil(playlist.songList.length / MAX_SONGLIST_SIZE)).keys(),
  ].forEach(index => {
    removeItem(`${playlist.id}.${index}`);
  });
};

export const delPlaylist = async (
  playlist: NoxMedia.Playlist,
  playlistIds: Array<string>
) => {
  playlistIds.splice(playlistIds.indexOf(playlist.id), 1);
  delPlaylistRaw(playlist);
  savePlaylistIds(playlistIds);
  return playlistIds;
};

export const saveFavPlaylist = async (playlist: NoxMedia.Playlist) =>
  savePlaylist(playlist, STORAGE_KEYS.FAVORITE_PLAYLIST_KEY);

export const savelastPlaylistId = async (val: [string, string]) =>
  saveItem(STORAGE_KEYS.LAST_PLAY_LIST, val);

export const savePlayMode = async (val: string) =>
  saveItem(STORAGE_KEYS.PLAYMODE_KEY, val);

export const saveLastPlayDuration = async (val: number) =>
  saveItem(STORAGE_KEYS.LAST_PLAY_DURATION, val);

export const initPlayerObject =
  async (): Promise<NoxStorage.PlayerStorageObject> => {
    const lyricMappingDict = (await getLyricMapping()) || {};
    const lyricMapping = new Map<string, NoxMedia.LyricDetail>();
    for (const [key, value] of Object.entries(lyricMappingDict)) {
      lyricMapping.set(key, value as NoxMedia.LyricDetail);
    }
    const playerObject = {
      settings: {
        ...DEFAULT_SETTING,
        ...((await getItem(STORAGE_KEYS.PLAYER_SETTING_KEY)) || {}),
      },
      playlistIds: (await getItem(STORAGE_KEYS.MY_FAV_LIST_KEY)) || [],
      playlists: {},
      lastPlaylistId: (await getItem(STORAGE_KEYS.LAST_PLAY_LIST)) || [
        'NULL',
        'NULL',
      ],
      searchPlaylist: dummyPlaylist(
        'Search',
        PLAYLIST_ENUMS.TYPE_SEARCH_PLAYLIST
      ),
      favoriPlaylist:
        (await getPlaylist(STORAGE_KEYS.FAVORITE_PLAYLIST_KEY)) ||
        dummyPlaylist('Favorite', PLAYLIST_ENUMS.TYPE_FAVORI_PLAYLIST),
      playerRepeat:
        (await getItem(STORAGE_KEYS.PLAYMODE_KEY)) || NoxRepeatMode.SHUFFLE,
      skin: (await getItem(STORAGE_KEYS.SKIN)) || AzusaTheme,
      skins: (await getPlayerSkins()) || [],
      cookies: (await getItem(STORAGE_KEYS.COOKIES)) || {},
      lyricMapping,
      lastPlayDuration: (await getItem(STORAGE_KEYS.LAST_PLAY_DURATION)) || 0,
    } as NoxStorage.PlayerStorageObject;

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
export const exportPlayerContent = async (content?: any) => {
  if (!content) {
    const allKeys = await AsyncStorage.getAllKeys();
    content = await AsyncStorage.multiGet(allKeys);
  }
  return compressSync(strToU8(JSON.stringify(content)));
};

const clearPlaylists = async () => {
  const playlistIds = (await getItem(STORAGE_KEYS.MY_FAV_LIST_KEY)) || [];
  for (const playlistId of playlistIds) {
    delPlaylistRaw(await getPlaylist(playlistId));
  }
  savePlaylistIds([]);
};

const importNoxExtensionContent = async (parsedContent: any) => {
  // noxextension stores everything as a giant object as it doesnt have the sqlite 2MB entry limitation;
  // it must have MyFavList as an array.
  if (!Array.isArray(parsedContent['MyFavList'])) {
    return false;
  }

  const saveImportedPlaylist = async () => {
    for (const playlistID of parsedContent['MyFavList']) {
      const playlist = parsedContent[playlistID];
      await savePlaylist({
        ...dummyPlaylistList,
        ...playlist,
        ...playlist.info,
        // HACK: seriously who thought of renaming variables is a good idea?
        // oh right that was me
        subscribeUrl: playlist.subscribeUrls,
        blacklistedUrl: playlist.bannedBVids,
      });
    }
  };

  const clearPlaylistNImport = async () => {
    await clearPlaylists();
    await saveImportedPlaylist();
    await savePlaylistIds(parsedContent['MyFavList']);
  };

  const addImportedPlaylist = async () => {
    await saveImportedPlaylist();
    await savePlaylistIds(
      (
        await getItem(STORAGE_KEYS.MY_FAV_LIST_KEY)
      ).concat(parsedContent['MyFavList'])
    );
  };

  return new Promise((resolve, reject) => {
    Alert.alert('ERROR', 'Are you importing from noxplayer extension?', [
      {
        text: 'No',
        onPress: () => {
          reject('user said no');
        },
        style: 'cancel',
      },
      {
        text: 'Overwrite',
        onPress: async () => {
          await clearPlaylistNImport();
          resolve(true);
        },
      },
      {
        text: 'Add',
        onPress: async () => {
          await addImportedPlaylist();
          resolve(true);
        },
      },
    ]);
  });
};

export const importPlayerContent = async (content: Uint8Array) => {
  try {
    const parsedContent = JSON.parse(strFromU8(decompressSync(content)));
    const parseImportedPartial = (
      key: string,
      parsedContent: Array<[string, string]>
    ) => {
      return JSON.parse(
        parsedContent.filter((val: [string, string]) => val[0] === key)[0][1]
      );
    };
    try {
      // detect noxplayer imports...
      if (await importNoxExtensionContent(parsedContent)) {
        return await initPlayerObject();
      }
    } catch (e) {
      console.error(e);
    }
    const importedAppID = parseImportedPartial(
      STORAGE_KEYS.PLAYER_SETTING_KEY,
      parsedContent
    ).appID;
    if (importedAppID !== appID) {
      throw new Error(`${importedAppID} is not valid appID`);
    } else {
      await clearStorage();
      await AsyncStorage.multiSet(parsedContent);
      return await initPlayerObject();
    }
  } catch (e) {
    logger.error(e);
    // cannot recover, clear storage and reinitialize. good to give an alert too.
    Alert.alert(
      'ERROR',
      'Error on loading previous setting data. user data is reset.',
      [{ text: 'OK', onPress: () => undefined }]
    );
    await clearStorage();
    return await initPlayerObject();
  }
};
