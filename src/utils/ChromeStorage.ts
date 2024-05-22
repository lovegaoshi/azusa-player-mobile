/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { strToU8, compressSync } from 'fflate';
import { v4 as uuidv4 } from 'uuid';
import { Appearance, ColorSchemeName } from 'react-native';
import i18n from 'i18next';

import { dummyPlaylist, dummyPlaylistList } from '../objects/Playlist';
import { NoxRepeatMode } from '../enums/RepeatMode';
import { PlaylistTypes } from '../enums/Playlist';
import AdaptiveTheme from '../components/styles/AdaptiveTheme';
import { chunkArray, arrayToObject } from '../utils/Utils';
import {
  StorageKeys,
  AppID,
  DefaultSetting,
  SearchOptions,
} from '@enums/Storage';
import { MUSICFREE } from './mediafetch/musicfree';
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
    // only enable this for serious debugging:P
    // console.log('saving %s %s into Map', key, value);
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(e);
  }
};

export const getItem = async (
  key: string,
  defaultVal: unknown = null
): Promise<null | any> => {
  try {
    const retrievedStr = await AsyncStorage.getItem(key);
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

export const setMusicFreePlugin = (val: MUSICFREE[]) =>
  saveItem(StorageKeys.MUSICFREE_PLUGIN, val);

export const getMusicFreePlugin = (): Promise<MUSICFREE[]> =>
  getItem(StorageKeys.MUSICFREE_PLUGIN, []);

export const getFadeInterval = async () =>
  Number(await getItem(StorageKeys.FADE_INTERVAL)) || 0;
export const saveFadeInterval = async (val: number) =>
  await saveItem(StorageKeys.FADE_INTERVAL, val);

/**
 * a save helper function for mapping types ({string: val}).
 * @returns the mapping object
 */
const getMapping = async (
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
    console.error(`failed to resolve mapping resources for ${key}.`);
    return transform([]);
  }
};

export const getRegExtractMapping = (): Promise<NoxRegExt.JSONExtractor[]> =>
  getItem(StorageKeys.REGEXTRACT_MAPPING, []);

export const saveRegextractMapping = (val: NoxRegExt.JSONExtractor[]) =>
  saveItem(StorageKeys.REGEXTRACT_MAPPING, val);

export const getR128GainMapping = (): Promise<NoxStorage.R128Dict> =>
  getMapping(StorageKeys.R128GAIN_MAPPING);

export const saveR128GainMapping = (val: NoxStorage.R128Dict) =>
  saveChucked(StorageKeys.R128GAIN_MAPPING, Object.entries(val));

export const getABMapping = (): Promise<NoxStorage.ABDict> =>
  getMapping(StorageKeys.ABREPEAT_MAPPING);

export const saveABMapping = async (val: NoxStorage.ABDict) =>
  saveChucked(StorageKeys.ABREPEAT_MAPPING, Object.entries(val));

export const getDefaultSearch = (): Promise<SearchOptions> =>
  getItem(StorageKeys.DEFAULT_SEARCH, SearchOptions.BILIBILI);

export const saveDefaultSearch = (val: SearchOptions | MUSICFREE) =>
  saveItem(StorageKeys.DEFAULT_SEARCH, val);

export const getCachedMediaMapping = () =>
  getItem(StorageKeys.CACHED_MEDIA_MAPPING, []);

export const saveCachedMediaMapping = (val: any[]) =>
  saveItem(StorageKeys.CACHED_MEDIA_MAPPING, val);

export const getColorScheme = async () => {
  const colorScheme = (await getItem(StorageKeys.COLORTHEME)) || null;
  Appearance.setColorScheme(colorScheme);
  return colorScheme;
};

export const saveColorScheme = (val: ColorSchemeName) =>
  saveItem(StorageKeys.COLORTHEME, val);

// we keep the set-cookie header for noxplayer's remove personal search option
// TODO: security risk. move this to an encrypted storage.
export const addCookie = async (site: string, setHeader: string) => {
  return;
  const cookies = (await getItem(StorageKeys.COOKIES)) || {};
  saveItem(StorageKeys.COOKIES, { ...cookies, [site]: setHeader });
};

export const removeCookie = async (site: string) => {
  const cookies = (await getItem(StorageKeys.COOKIES)) || {};
  cookies[site] = [];
  saveItem(StorageKeys.COOKIES, cookies);
};

/**
 * a generic chunk splitter to store arrays that may exceed 2MB storage limits.
 * see known storage limits:
 * https://react-native-async-storage.github.io/async-storage/docs/limits
 */
const saveChucked = async (
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

const loadChucked = async (keys: string[]) => {
  const loadedArrays = (await Promise.all(
    keys.map(async (val: string) => await getItem(val))
  )) as any[][];
  return loadedArrays.flat();
};
/**
 * playlist can get quite large, my idea is to splice songlist into smaller lists then join them.
 */
export const savePlaylist = async (
  playlist: NoxMedia.Playlist,
  overrideKey: string | null = null
) => {
  try {
    const savingPlaylist = {
      ...playlist,
      songList: await saveChucked(playlist.id, playlist.songList, false),
    };
    // save chunks
    saveItem(overrideKey || playlist.id || uuidv4(), savingPlaylist);
  } catch (e) {
    console.error(e);
  }
};
interface GetPlaylist {
  key: string;
  defaultPlaylist?: () => NoxMedia.Playlist;
  hydrateSongList?: boolean;
}

/**
 * note this method always return a playlist, if error occurs a dummy one is
 * returned.
 */
export const getPlaylist = async ({
  key,
  defaultPlaylist = dummyPlaylist,
  hydrateSongList = true,
}: GetPlaylist): Promise<NoxMedia.Playlist> => {
  const dPlaylist = defaultPlaylist();
  try {
    const retrievedPlaylist = await getItem(key);
    if (retrievedPlaylist === null) return dPlaylist;
    retrievedPlaylist.songList = hydrateSongList
      ? await loadChucked(retrievedPlaylist.songList)
      : [];
    return { ...dPlaylist, ...retrievedPlaylist };
  } catch (e) {
    console.error(e);
  }
  return dPlaylist;
};

export const savePlayerSkins = async (skins: any[]) =>
  saveChucked(StorageKeys.SKINSTORAGE, skins);

export const getPlayerSkins = async () =>
  await loadChucked(await getItem(StorageKeys.SKINSTORAGE, []));

export const saveLyricMapping = async (
  lyricMapping: Map<string, NoxMedia.LyricDetail>
) => saveChucked(StorageKeys.LYRIC_MAPPING, Array.from(lyricMapping.entries()));

export const getLyricMapping = () =>
  getMapping(StorageKeys.LYRIC_MAPPING, (val: any) => new Map(val));

// no point to provide getters, as states are managed by zustand.
// unlike azusaplayer which the storage context still reads localstorage, instaed
// of keeping them as states.
export const saveSettings = (setting: NoxStorage.PlayerSettingDict) =>
  saveItem(StorageKeys.PLAYER_SETTING_KEY, setting);

export const getSettings = async () => ({
  ...DefaultSetting,
  ...(await getItem(StorageKeys.PLAYER_SETTING_KEY, {})),
});

export const savePlaylistIds = (val: string[]) =>
  saveItem(StorageKeys.MY_FAV_LIST_KEY, val);

export const savePlayerSkin = (val: NoxTheme.Style | NoxTheme.AdaptiveStyle) =>
  saveItem(StorageKeys.SKIN, val);

export const getPlayerSkin = () => getItem(StorageKeys.SKIN);

export const addPlaylist = (
  playlist: NoxMedia.Playlist,
  playlistIds: string[]
) => {
  playlistIds.push(playlist.id);
  savePlaylist(playlist);
  savePlaylistIds(playlistIds);
  return playlistIds;
};

const _delPlaylist = async (playlistId: string) => {
  removeItem(playlistId);
  (await AsyncStorage.getAllKeys())
    .filter(k => k.startsWith(`${playlistId}.`))
    .forEach(k => removeItem(k));
};

export const delPlaylist = (playlistId: string, playlistIds: string[]) => {
  const playlistIds2 = [...playlistIds];
  playlistIds2.splice(playlistIds2.indexOf(playlistId), 1);
  _delPlaylist(playlistId);
  savePlaylistIds(playlistIds2);
  return playlistIds2;
};

export const saveFavPlaylist = (playlist: NoxMedia.Playlist) =>
  savePlaylist(playlist, StorageKeys.FAVORITE_PLAYLIST_KEY);

export const savelastPlaylistId = (val: [string, string]) =>
  saveItem(StorageKeys.LAST_PLAY_LIST, val);

export const savePlayMode = (val: string) =>
  saveItem(StorageKeys.PLAYMODE_KEY, val);

export const saveLastPlayDuration = (val: number) =>
  saveItem(StorageKeys.LAST_PLAY_DURATION, val);

export const initPlayerObject = async (
  safeMode = false
): Promise<NoxStorage.PlayerStorageObject> => {
  const lyricMapping = (await getLyricMapping()) || {};
  const playerObject = {
    settings: {
      ...DefaultSetting,
      ...((await getItem(StorageKeys.PLAYER_SETTING_KEY)) || {}),
    },
    playlistIds: (await getItem(StorageKeys.MY_FAV_LIST_KEY)) || [],
    playlists: {},
    lastPlaylistId: (await getItem(StorageKeys.LAST_PLAY_LIST)) || [
      'NULL',
      'NULL',
    ],
    searchPlaylist: dummyPlaylist(
      i18n.t('PlaylistOperations.searchListName'),
      PlaylistTypes.Search
    ),
    favoriPlaylist: await getPlaylist({
      key: StorageKeys.FAVORITE_PLAYLIST_KEY,
      defaultPlaylist: () => dummyPlaylist('Favorite', PlaylistTypes.Favorite),
    }),
    playbackMode: await getItem(
      StorageKeys.PLAYMODE_KEY,
      NoxRepeatMode.Shuffle
    ),
    skin: await getItem(StorageKeys.SKIN, AdaptiveTheme),
    skins: (await getPlayerSkins()) || [],
    cookies: await getItem(StorageKeys.COOKIES, {}),
    lyricMapping,
    lastPlayDuration: await getItem(StorageKeys.LAST_PLAY_DURATION, 0),
    colorScheme: await getColorScheme(),
    defaultSearchOptions: await getDefaultSearch(),
  } as NoxStorage.PlayerStorageObject;

  if (safeMode) {
    playerObject.settings = { ...DefaultSetting };
    playerObject.lastPlaylistId = ['NULL', 'NULL'];
    playerObject.playbackMode = NoxRepeatMode.Shuffle;
    playerObject.lastPlayDuration = 0;
    playerObject.defaultSearchOptions = undefined;
  }

  playerObject.playlists[StorageKeys.SEARCH_PLAYLIST_KEY] =
    playerObject.searchPlaylist;
  playerObject.playlists[StorageKeys.FAVORITE_PLAYLIST_KEY] =
    playerObject.favoriPlaylist;

  await Promise.all(
    playerObject.playlistIds.map(async id => {
      const retrievedPlaylist = await getPlaylist({
        key: id,
        hydrateSongList: !playerObject.settings.memoryEfficiency,
      });
      if (retrievedPlaylist) playerObject.playlists[id] = retrievedPlaylist;
    })
  );

  return playerObject;
};

export const clearStorage = () => AsyncStorage.clear();

// gzip
export const exportPlayerContent = async (content?: any) => {
  if (!content) {
    const allKeys = await AsyncStorage.getAllKeys();
    content = await AsyncStorage.multiGet(allKeys);
  }
  return compressSync(strToU8(JSON.stringify(content)));
};

const clearPlaylists = async () => {
  const playlistIds = (await getItem(StorageKeys.MY_FAV_LIST_KEY)) || [];
  playlistIds.forEach(_delPlaylist);
  savePlaylistIds([]);
};

const saveImportedPlaylist = async (playlists: any[]) => {
  for (const playlist of playlists) {
    await savePlaylist({
      ...dummyPlaylistList,
      // HACK: seriously who thought of renaming variables is a good idea?
      // oh right that was me
      subscribeUrl: playlist.subscribeUrls,
      blacklistedUrl: playlist.bannedBVids,
      ...playlist,
      ...playlist.info,
    });
  }
};

export const clearPlaylistNImport = async (parsedContent: any) => {
  await clearPlaylists();
  await saveImportedPlaylist(
    parsedContent[StorageKeys.MY_FAV_LIST_KEY].map(
      (val: string) => parsedContent[val]
    )
  );
  await savePlaylistIds(parsedContent[StorageKeys.MY_FAV_LIST_KEY]);
};

export const addImportedPlaylist = async (playlists: any[]) => {
  await saveImportedPlaylist(playlists);
  await savePlaylistIds(
    (await getItem(StorageKeys.MY_FAV_LIST_KEY)).concat(
      playlists.map(val => val.info.id)
    )
  );
};

const parseImportedPartial = (
  key: string,
  parsedContent: [string, string][]
) => {
  return JSON.parse(
    parsedContent.filter((val: [string, string]) => val[0] === key)[0][1]
  );
};

export const importPlayerContentRaw = async (parsedContent: any) => {
  const importedAppID = parseImportedPartial(
    StorageKeys.PLAYER_SETTING_KEY,
    parsedContent
  ).appID;
  if (importedAppID !== AppID) {
    throw new Error(`${importedAppID} is not valid appID`);
  } else {
    const oldCache = await getCachedMediaMapping();
    await clearStorage();
    await AsyncStorage.multiSet(parsedContent);
    await saveCachedMediaMapping(oldCache);
    return await initPlayerObject();
  }
};
