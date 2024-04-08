/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { strToU8, compressSync } from 'fflate';
import { v4 as uuidv4 } from 'uuid';
import { Appearance, ColorSchemeName } from 'react-native';
import i18n from 'i18next';

import { dummyPlaylist, dummyPlaylistList } from '../objects/Playlist';
import AzusaTheme from '../components/styles/AzusaTheme';
import { chunkArray as chunkArrayRaw, arrayToObject } from '../utils/Utils';
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
  saveItem(NoxEnum.Storage.StorageKeys.MUSICFREE_PLUGIN, val);

export const getMusicFreePlugin = (): Promise<MUSICFREE[]> =>
  getItem(NoxEnum.Storage.StorageKeys.MUSICFREE_PLUGIN, []);

export const getFadeInterval = async () =>
  Number(await getItem(NoxEnum.Storage.StorageKeys.FADE_INTERVAL)) || 0;
export const saveFadeInterval = async (val: number) =>
  await saveItem(NoxEnum.Storage.StorageKeys.FADE_INTERVAL, val);

/**
 * a save helper function for mapping types ({string: val}).
 * @returns the mapping object
 */
const getMapping = async (
  key: NoxEnum.Storage.StorageKeys,
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
  getItem(NoxEnum.Storage.StorageKeys.REGEXTRACT_MAPPING, []);

export const saveRegextractMapping = (val: NoxRegExt.JSONExtractor[]) =>
  saveItem(NoxEnum.Storage.StorageKeys.REGEXTRACT_MAPPING, val);

export const getR128GainMapping = (): Promise<NoxStorage.R128Dict> =>
  getMapping(NoxEnum.Storage.StorageKeys.R128GAIN_MAPPING);

export const saveR128GainMapping = (val: NoxStorage.R128Dict) =>
  saveChucked(
    NoxEnum.Storage.StorageKeys.R128GAIN_MAPPING,
    Object.entries(val)
  );

export const getABMapping = (): Promise<NoxStorage.ABDict> =>
  getMapping(NoxEnum.Storage.StorageKeys.ABREPEAT_MAPPING);

export const saveABMapping = async (val: NoxStorage.ABDict) =>
  saveChucked(
    NoxEnum.Storage.StorageKeys.ABREPEAT_MAPPING,
    Object.entries(val)
  );

export const getDefaultSearch = (): Promise<NoxEnum.Storage.SearchOptions> =>
  getItem(
    NoxEnum.Storage.StorageKeys.DEFAULT_SEARCH,
    NoxEnum.Storage.SearchOptions.BILIBILI
  );

export const saveDefaultSearch = (
  val: NoxEnum.Storage.SearchOptions | MUSICFREE
) => saveItem(NoxEnum.Storage.StorageKeys.DEFAULT_SEARCH, val);

export const getCachedMediaMapping = () =>
  getItem(NoxEnum.Storage.StorageKeys.CACHED_MEDIA_MAPPING, []);

export const saveCachedMediaMapping = (val: any[]) =>
  saveItem(NoxEnum.Storage.StorageKeys.CACHED_MEDIA_MAPPING, val);

export const getColorScheme = async () => {
  const colorScheme =
    (await getItem(NoxEnum.Storage.StorageKeys.COLORTHEME)) || null;
  Appearance.setColorScheme(colorScheme);
  return colorScheme;
};

export const saveColorScheme = (val: ColorSchemeName) =>
  saveItem(NoxEnum.Storage.StorageKeys.COLORTHEME, val);

// we keep the set-cookie header for noxplayer's remove personal search option
// TODO: security risk. move this to an encrypted storage.
export const addCookie = async (site: string, setHeader: string) => {
  return;
  const cookies = (await getItem(NoxEnum.Storage.StorageKeys.COOKIES)) || {};
  saveItem(NoxEnum.Storage.StorageKeys.COOKIES, {
    ...cookies,
    [site]: setHeader,
  });
};

export const removeCookie = async (site: string) => {
  const cookies = (await getItem(NoxEnum.Storage.StorageKeys.COOKIES)) || {};
  cookies[site] = [];
  saveItem(NoxEnum.Storage.StorageKeys.COOKIES, cookies);
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
  key: string,
  objects: Array<any>,
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
      songList: await saveChucked(playlist.id, playlist.songList, false),
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
export const getPlaylist = async (
  key: string,
  defaultPlaylist: () => NoxMedia.Playlist = dummyPlaylist
): Promise<NoxMedia.Playlist> => {
  const dPlaylist = defaultPlaylist();
  try {
    const retrievedPlaylist = await getItem(key);
    if (retrievedPlaylist === null) return dPlaylist;
    retrievedPlaylist.songList = await loadChucked(retrievedPlaylist.songList);
    return { ...dPlaylist, ...retrievedPlaylist };
  } catch (e) {
    console.error(e);
  }
  return dPlaylist;
};

export const savePlayerSkins = async (skins: Array<any>) =>
  saveChucked(NoxEnum.Storage.StorageKeys.SKINSTORAGE, skins);

export const getPlayerSkins = async () =>
  await loadChucked(await getItem(NoxEnum.Storage.StorageKeys.SKINSTORAGE, []));

export const saveLyricMapping = async (
  lyricMapping: Map<string, NoxMedia.LyricDetail>
) =>
  saveChucked(
    NoxEnum.Storage.StorageKeys.LYRIC_MAPPING,
    Array.from(lyricMapping.entries())
  );

export const getLyricMapping = () =>
  getMapping(
    NoxEnum.Storage.StorageKeys.LYRIC_MAPPING,
    (val: any) => new Map(val)
  );

// no point to provide getters, as states are managed by zustand.
// unlike azusaplayer which the storage context still reads localstorage, instaed
// of keeping them as states.
export const saveSettings = (setting: NoxStorage.PlayerSettingDict) =>
  saveItem(NoxEnum.Storage.StorageKeys.PLAYER_SETTING_KEY, setting);

export const getSettings = async () => ({
  ...NoxEnum.Storage.DefaultSetting,
  ...(await getItem(NoxEnum.Storage.StorageKeys.PLAYER_SETTING_KEY, {})),
});

export const savePlaylistIds = (val: string[]) =>
  saveItem(NoxEnum.Storage.StorageKeys.MY_FAV_LIST_KEY, val);

export const savePlayerSkin = (val: NoxTheme.Style | NoxTheme.AdaptiveStyle) =>
  saveItem(NoxEnum.Storage.StorageKeys.SKIN, val);

export const getPlayerSkin = () => getItem(NoxEnum.Storage.StorageKeys.SKIN);

export const addPlaylist = (
  playlist: NoxMedia.Playlist,
  playlistIds: Array<string>
) => {
  playlistIds.push(playlist.id);
  savePlaylist(playlist);
  savePlaylistIds(playlistIds);
  return playlistIds;
};

const delPlaylistRaw = (playlist: NoxMedia.Playlist) => {
  removeItem(playlist.id);
  [
    ...Array(Math.ceil(playlist.songList.length / MAX_SONGLIST_SIZE)).keys(),
  ].forEach(index => {
    removeItem(`${playlist.id}.${index}`);
  });
};

export const delPlaylist = (
  playlist: NoxMedia.Playlist,
  playlistIds: Array<string>
) => {
  playlistIds.splice(playlistIds.indexOf(playlist.id), 1);
  delPlaylistRaw(playlist);
  savePlaylistIds(playlistIds);
  return playlistIds;
};

export const saveFavPlaylist = (playlist: NoxMedia.Playlist) =>
  savePlaylist(playlist, NoxEnum.Storage.StorageKeys.FAVORITE_PLAYLIST_KEY);

export const savelastPlaylistId = (val: [string, string]) =>
  saveItem(NoxEnum.Storage.StorageKeys.LAST_PLAY_LIST, val);

export const savePlayMode = (val: string) =>
  saveItem(NoxEnum.Storage.StorageKeys.PLAYMODE_KEY, val);

export const saveLastPlayDuration = (val: number) =>
  saveItem(NoxEnum.Storage.StorageKeys.LAST_PLAY_DURATION, val);

export const initPlayerObject =
  async (): Promise<NoxStorage.PlayerStorageObject> => {
    const lyricMapping = (await getLyricMapping()) || {};
    const playerObject = {
      settings: {
        ...NoxEnum.Storage.DefaultSetting,
        ...((await getItem(NoxEnum.Storage.StorageKeys.PLAYER_SETTING_KEY)) ||
          {}),
      },
      playlistIds:
        (await getItem(NoxEnum.Storage.StorageKeys.MY_FAV_LIST_KEY)) || [],
      playlists: {},
      lastPlaylistId: (await getItem(
        NoxEnum.Storage.StorageKeys.LAST_PLAY_LIST
      )) || ['NULL', 'NULL'],
      searchPlaylist: dummyPlaylist(
        i18n.t('PlaylistOperations.searchListName'),
        NoxEnum.Playlist.PlaylistEnums.TYPE_SEARCH_PLAYLIST
      ),
      favoriPlaylist: await getPlaylist(
        NoxEnum.Storage.StorageKeys.FAVORITE_PLAYLIST_KEY,
        () =>
          dummyPlaylist(
            'Favorite',
            NoxEnum.Playlist.PlaylistEnums.TYPE_FAVORI_PLAYLIST
          )
      ),
      playbackMode: await getItem(
        NoxEnum.Storage.StorageKeys.PLAYMODE_KEY,
        NoxEnum.RNTP.NoxRepeatMode.SHUFFLE
      ),
      skin: await getItem(NoxEnum.Storage.StorageKeys.SKIN, AzusaTheme),
      skins: (await getPlayerSkins()) || [],
      cookies: await getItem(NoxEnum.Storage.StorageKeys.COOKIES, {}),
      lyricMapping,
      lastPlayDuration: await getItem(
        NoxEnum.Storage.StorageKeys.LAST_PLAY_DURATION,
        0
      ),
      colorScheme: await getColorScheme(),
      defaultSearchOptions: await getDefaultSearch(),
    } as NoxStorage.PlayerStorageObject;

    playerObject.playlists[NoxEnum.Storage.StorageKeys.SEARCH_PLAYLIST_KEY] =
      playerObject.searchPlaylist;
    playerObject.playlists[NoxEnum.Storage.StorageKeys.FAVORITE_PLAYLIST_KEY] =
      playerObject.favoriPlaylist;

    await Promise.all(
      playerObject.playlistIds.map(async id => {
        const retrievedPlaylist = await getPlaylist(id);
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
  const playlistIds =
    (await getItem(NoxEnum.Storage.StorageKeys.MY_FAV_LIST_KEY)) || [];
  for (const playlistId of playlistIds) {
    delPlaylistRaw(await getPlaylist(playlistId));
  }
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
    parsedContent[NoxEnum.Storage.StorageKeys.MY_FAV_LIST_KEY].map(
      (val: string) => parsedContent[val]
    )
  );
  await savePlaylistIds(
    parsedContent[NoxEnum.Storage.StorageKeys.MY_FAV_LIST_KEY]
  );
};

export const addImportedPlaylist = async (playlists: any[]) => {
  await saveImportedPlaylist(playlists);
  await savePlaylistIds(
    (await getItem(NoxEnum.Storage.StorageKeys.MY_FAV_LIST_KEY)).concat(
      playlists.map(val => val.info.id)
    )
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
    NoxEnum.Storage.StorageKeys.PLAYER_SETTING_KEY,
    parsedContent
  ).appID;
  if (importedAppID !== NoxEnum.Storage.AppID) {
    throw new Error(`${importedAppID} is not valid appID`);
  } else {
    const oldCache = await getCachedMediaMapping();
    await clearStorage();
    await AsyncStorage.multiSet(parsedContent);
    await saveCachedMediaMapping(oldCache);
    return await initPlayerObject();
  }
};
