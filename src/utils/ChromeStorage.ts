/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { strToU8, compressSync } from 'fflate';
import { v4 as uuidv4 } from 'uuid';
import { Appearance, ColorSchemeName } from 'react-native';

import { dummyPlaylist, dummyPlaylistList } from '../objects/Playlist';
import { NoxRepeatMode } from '../enums/RepeatMode';
import { PLAYLIST_ENUMS } from '../enums/Playlist';
import AzusaTheme from '../components/styles/AzusaTheme';
import { chunkArray as chunkArrayRaw } from '../utils/Utils';
import type { NoxStorage } from '../types/storage';
import {
  STORAGE_KEYS,
  appID,
  DEFAULT_SETTING,
  SEARCH_OPTIONS,
} from '@enums/Storage';
import { MUSICFREE } from './mediafetch/mfsdk';
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

export const getFadeInterval = async () =>
  Number(await getItem(STORAGE_KEYS.FADE_INTERVAL)) || 0;
export const saveFadeInterval = async (val: number) =>
  await saveItem(STORAGE_KEYS.FADE_INTERVAL, val);

/**
 * a save helper function for mapping types ({string: val}).
 * @returns nothing
 */
async function saveMapping<T>(key: STORAGE_KEYS, val: { [key: string]: T }) {
  return await saveItem(key, val);
  const result = Object.keys(val).map(key => [key, val[key]]);
  return await saveChucked(result, STORAGE_KEYS.R128GAIN_MAPPING);
}

/**
 * a save helper function for mapping types ({string: val}).
 * @returns the mapping object
 */
const getMapping = async (key: STORAGE_KEYS) => {
  return (await getItem(key)) || {};
  // TODO: does dict get too long  that this is necessary?
  const result = (await loadChucked(
    (await getItem(STORAGE_KEYS.R128GAIN_MAPPING)) || []
  )) as [string, any][];
  return result.reduce((acc, val) => {
    acc[val[0]] = val[1];
    return acc;
  }, {} as NoxStorage.R128Dict);
};

export const getRegExtractMapping = async () => {
  return (
    ((await getItem(
      STORAGE_KEYS.REGEXTRACT_MAPPING
    )) as NoxRegExt.JSONExtractor[]) || []
  );
};

export const saveRegextractMapping = async (val: NoxRegExt.JSONExtractor[]) => {
  return await saveItem(STORAGE_KEYS.REGEXTRACT_MAPPING, val);
};

export const getR128GainMapping = async () => {
  return (await getMapping(
    STORAGE_KEYS.R128GAIN_MAPPING
  )) as NoxStorage.R128Dict;
};

export const saveR128GainMapping = async (val: NoxStorage.R128Dict) => {
  return await saveMapping(STORAGE_KEYS.R128GAIN_MAPPING, val);
};

export const getABMapping = async () => {
  return (await getMapping(STORAGE_KEYS.ABREPEAT_MAPPING)) as NoxStorage.ABDict;
};

export const saveABMapping = async (val: NoxStorage.ABDict) => {
  return await saveMapping(STORAGE_KEYS.ABREPEAT_MAPPING, val);
};

export const getDefaultSearch = async (): Promise<SEARCH_OPTIONS> => {
  return (
    (await getItem(STORAGE_KEYS.DEFAULT_SEARCH)) || SEARCH_OPTIONS.BILIBILI
  );
};

export const saveDefaultSearch = async (val: SEARCH_OPTIONS | MUSICFREE) => {
  return await saveItem(STORAGE_KEYS.DEFAULT_SEARCH, val);
};

export const getCachedMediaMapping = async () => {
  return (await getItem(STORAGE_KEYS.CACHED_MEDIA_MAPPING)) || [];
};

export const saveCachedMediaMapping = async (val: any[]) => {
  return await saveItem(STORAGE_KEYS.CACHED_MEDIA_MAPPING, val);
};

export const getColorScheme = async () => {
  const colorScheme = (await getItem(STORAGE_KEYS.COLORTHEME)) || null;
  Appearance.setColorScheme(colorScheme);
  return colorScheme;
};

export const saveColorScheme = async (val: ColorSchemeName) => {
  return await saveItem(STORAGE_KEYS.COLORTHEME, val);
};

// we keep the set-cookie header for noxplayer's remove personal search option
// TODO: security risk. move this to an encrypted storage.
export const addCookie = async (site: string, setHeader: string) => {
  return;
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

export const savePlayerSkin = async (
  val: NoxTheme.Style | NoxTheme.AdaptiveStyle
) => saveItem(STORAGE_KEYS.SKIN, val);

export const getPlayerSkin = async () => await getItem(STORAGE_KEYS.SKIN);

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
      colorScheme: await getColorScheme(),
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

const saveImportedPlaylist = async (playlists: any[]) => {
  for (const playlist of playlists) {
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

export const clearPlaylistNImport = async (parsedContent: any) => {
  await clearPlaylists();
  await saveImportedPlaylist(
    parsedContent['MyFavList'].map((val: string) => parsedContent[val])
  );
  await savePlaylistIds(parsedContent['MyFavList']);
};

export const addImportedPlaylist = async (playlists: any[]) => {
  await saveImportedPlaylist(playlists);
  await savePlaylistIds(
    (
      await getItem(STORAGE_KEYS.MY_FAV_LIST_KEY)
    ).concat(playlists.map(val => val.info.id))
  );
};

const parseImportedPartial = (
  key: string,
  parsedContent: Array<[string, string]>
) => {
  return JSON.parse(
    parsedContent.filter((val: [string, string]) => val[0] === key)[0][1]
  );
};

export const importPlayerContentRaw = async (parsedContent: any) => {
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
};
