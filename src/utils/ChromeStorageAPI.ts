/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';
import { strToU8, compressSync } from 'fflate';

import { chunkArray, arrayToObject } from '../utils/Utils';
import { StorageKeys } from '@enums/Storage';
import { AppID } from '@objects/Storage';
import AdaptiveTheme from '../components/styles/AdaptiveTheme';
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

export const saveItem = async (
  key: string,
  value: unknown,
  setFunc: (k: string, v: string) => Promise<void> = AsyncStorage.setItem,
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
  getFunc: (k: string) => Promise<any> = AsyncStorage.getItem,
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
    await AsyncStorage.removeItem(key);
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
 * see known storage limits:
 * https://react-native-async-storage.github.io/async-storage/docs/limits
 */
export const saveChucked = async (
  key: string,
  objects: any[],
  saveToStorage = true,
) => {
  // splice into chunks
  const chuckedObject = chunkArray(objects, MAX_SONGLIST_SIZE);
  const chuckedIndices = chuckedObject.map((val, index) => `${key}.${index}`);
  chuckedObject.forEach((list, index) => saveItem(chuckedIndices[index], list));
  if (saveToStorage) {
    saveItem(key, chuckedIndices);
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
    saveItem(overrideKey ?? playlist.id ?? uuidv4(), savingPlaylist);
  } catch (e) {
    console.error(e);
  }
};

export const delPlaylist = async (playlistId: string) => {
  removeItem(playlistId);
  (await AsyncStorage.getAllKeys())
    .filter(k => k.startsWith(`${playlistId}.`))
    .forEach(k => removeItem(k));
};

const clearStorage = () => AsyncStorage.clear();

export const exportPlayerContent = async (content?: any) => {
  if (!content) {
    const allKeys = await AsyncStorage.getAllKeys();
    content = await AsyncStorage.multiGet(allKeys);
  }
  return compressSync(strToU8(JSON.stringify(content)));
};

const parseImportedPartial = (
  key: string,
  parsedContent: [string, string][],
) => {
  return JSON.parse(
    parsedContent.filter((val: [string, string]) => val[0] === key)[0][1],
  );
};

export const importPlayerContentRaw = async (
  parsedContent: any,
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
    await AsyncStorage.multiSet(parsedContent);
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
