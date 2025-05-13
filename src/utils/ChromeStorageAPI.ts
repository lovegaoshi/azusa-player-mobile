/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from 'expo-sqlite/kv-store';
import { Appearance, ColorSchemeName } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';
import { strToU8, compressSync } from 'fflate';

import { chunkArray, arrayToObject } from '../utils/Utils';
import { StorageKeys, StoragePlaceholders } from '@enums/Storage';
import { AppID } from '@objects/Storage';
import AdaptiveTheme from '../components/styles/AdaptiveTheme';
import { exportSQL } from '@utils/db/sqlAPI';
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
const MAX_SONGLIST_SIZE = 400;

export const saveItem = async (
  key: string,
  value: unknown,
  setFunc: (k: string, v: string) => Promise<void> = AsyncStorage.setItem.bind(
    AsyncStorage,
  ),
) => {
  try {
    await setFunc(key, JSON.stringify(value));
  } catch (e) {
    console.error(e);
  }
};

export const getItem = async (
  key: string,
  defaultVal: unknown = null,
  getFunc: (k: string) => Promise<any> = AsyncStorage.getItem.bind(
    AsyncStorage,
  ),
): Promise<null | any> => {
  try {
    const retrievedStr = await getFunc(key);
    return retrievedStr === null ? defaultVal : JSON.parse(retrievedStr);
  } catch (e) {
    console.error(e);
  }
  return defaultVal;
};

export const removeItem = async (key: string) => {
  try {
    await AsyncStorage.removeItem.bind(AsyncStorage)(key);
  } catch (e) {
    console.warn(e);
  }
};

/**
 * a save helper function for mapping types ({string: val}).
 * @returns the mapping object
 */
export const getMapping = async (
  key: StorageKeys,
  transform: (val: any) => any = arrayToObject,
) => {
  try {
    const result = await getItem(key);
    if (result === null) return transform([]);
    return Array.isArray(result)
      ? transform(await loadChucked(result))
      : result;
  } catch (e) {
    console.error(`failed to resolve mapping resources for ${key}: ${e}`);
    return transform([]);
  }
};

/**
 * a generic chunk splitter to store arrays that may exceed 2MB storage limits.
 */
export const saveChucked = async (
  key: string,
  objects: any[],
  saveToStorage = true,
) => {
  // splice into chunks
  const chuckedObject = chunkArray(objects, MAX_SONGLIST_SIZE);
  const chuckedIndices = chuckedObject.map((val, index) => `${key}.${index}`);
  await Promise.all(
    chuckedObject.map((list, index) => saveItem(chuckedIndices[index], list)),
  );
  if (saveToStorage) {
    await saveItem(key, chuckedIndices);
    return [];
  } else {
    return chuckedIndices;
  }
};

export const loadChucked = async (keys: string[]) => {
  const loadedArrays = (await Promise.all(
    keys.map(async (val: string) => await getItem(val, [])),
  )) as any[][];
  return loadedArrays.flat();
};

export const saveSecure = (key: string, value: unknown) =>
  saveItem(key, value, SecureStore.setItemAsync);

export const getSecure = (key: string, defaultVal: unknown = null) =>
  getItem(key, defaultVal, SecureStore.getItemAsync);

/**
 * playlist can get quite large, my idea is to splice songlist into smaller lists then join them.
 */
export const savePlaylist = async (
  playlist: NoxMedia.Playlist,
  overrideKey: string | null = null,
) => {
  try {
    const savingPlaylist = {
      ...playlist,
      songList: await saveChucked(playlist.id, playlist.songList, false),
    };
    // save chunks
    await saveItem(overrideKey ?? playlist.id ?? uuidv4(), savingPlaylist);
  } catch (e) {
    console.error(e);
  }
};

export const delPlaylist = async (playlistId: string) => {
  removeItem(playlistId);
  const allkeys = await AsyncStorage.getAllKeys.bind(AsyncStorage)();
  const playlistKeys = allkeys.filter(k => k.startsWith(`${playlistId}.`));
  return Promise.all(playlistKeys.map(k => removeItem(k)));
};

const clearStorage = () => AsyncStorage.clear.bind(AsyncStorage)();

const getPlayerContent = async (content?: any) => {
  if (content) {
    return content;
  }
  const allKeys = await AsyncStorage.getAllKeys.bind(AsyncStorage)();
  const retrivedContent =
    await AsyncStorage.multiGet.bind(AsyncStorage)(allKeys);
  retrivedContent.push([StorageKeys.SQL_PLACEHOLDER, await exportSQL()]);
  return retrivedContent;
};

export const exportPlayerContent = async (content?: any) => {
  return compressSync(strToU8(JSON.stringify(await getPlayerContent(content))));
};

const parseImportedPartial = (
  key: string,
  parsedContent: [string, string][],
) => {
  return JSON.parse(parsedContent.filter(val => val[0] === key)[0][1]);
};

const removePlaceholders = (p: [string, string][]) =>
  p.filter(v => !StoragePlaceholders.includes(v[0] as StorageKeys));

export const importPlayerContentRaw = async (
  parsedContent: [string, string][],
  getContent: () => Promise<any>,
) => {
  const importedAppID = parseImportedPartial(
    StorageKeys.PLAYER_SETTING_KEY,
    parsedContent,
  ).appID;
  if (importedAppID !== AppID) {
    throw new Error(`${importedAppID} is not valid appID`);
  } else {
    const content = await getContent();
    await clearStorage();
    await AsyncStorage.multiSet.bind(AsyncStorage)(
      removePlaceholders(parsedContent),
    );
    return content;
  }
};

export const getColorScheme = async () => {
  const colorScheme = await getItem(StorageKeys.COLORTHEME, null);
  Appearance.setColorScheme(colorScheme);
  return colorScheme;
};

export const saveColorScheme = (val: ColorSchemeName) =>
  saveItem(StorageKeys.COLORTHEME, val);

export const getPlaylistSongList = async (
  playlist?: NoxMedia.Playlist,
): Promise<NoxMedia.Song[]> =>
  !playlist?.songList
    ? []
    : loadChucked(playlist.songList as unknown as string[]);

export const getRegExtractMapping = async () => undefined;

export const getDefaultTheme = () => AdaptiveTheme;
