/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { chunkArray, arrayToObject } from '../utils/Utils';
import { StorageKeys } from '@enums/Storage';
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
  setFunc: (k: string, v: string) => Promise<void> = AsyncStorage.setItem
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
  getFunc: (k: string) => Promise<any> = AsyncStorage.getItem
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
  transform: (val: any) => any = arrayToObject
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
  saveToStorage = true
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
    keys.map(async (val: string) => await getItem(val))
  )) as any[][];
  return loadedArrays.flat();
};

export const saveSecure = (key: string, value: unknown) =>
  saveItem(key, value, SecureStore.setItemAsync);

export const getSecure = (key: string, defaultVal: unknown = null) =>
  getItem(key, defaultVal, SecureStore.getItemAsync);
