/* eslint-disable @typescript-eslint/no-explicit-any */
import i18n from 'i18next';

import {
  saveItem,
  getItem,
  getMapping,
  saveChucked,
  loadChucked,
  delPlaylist as _delPlaylist,
  importPlayerContentRaw as _importPlayerContentRaw,
  getColorScheme,
  getPlaylistSongList,
  getRegExtractMapping as _getRegExtractMapping,
  getDefaultTheme,
} from '@utils/ChromeStorageAPI';
import { getPlaylist as getPlaylistSQL } from '@utils/db/sqlAPI';
import { dummyPlaylist, dummyPlaylistList } from '@objects/Playlist';
import { NoxRepeatMode } from '@enums/RepeatMode';
import { PlaylistTypes } from '@enums/Playlist';
import { StorageKeys, SearchOptions } from '@enums/Storage';
import { DefaultSetting, OverrideSetting } from '@objects/Storage';
import { getAlistCred } from './alist/storage';
import { timeFunction } from './Utils';
import { importSQL, savePlaylist } from '../utils/db/sqlStorage';

export const getFadeInterval = async () =>
  Number(await getItem(StorageKeys.FADE_INTERVAL)) || 0;

export const saveFadeInterval = (val: number) =>
  saveItem(StorageKeys.FADE_INTERVAL, val);

export const getRegExtractMapping = async (): Promise<
  NoxRegExt.JSONExtractor[]
> =>
  (await _getRegExtractMapping()) ??
  getItem(StorageKeys.REGEXTRACT_MAPPING, []);

export const saveRegextractMapping = (val: NoxRegExt.JSONExtractor[]) =>
  saveItem(StorageKeys.REGEXTRACT_MAPPING, val);

/**
 * @deprecated
 * migrated to SQL based solutions.
 */
export const getR128GainMapping = (): Promise<NoxStorage.R128Dict> =>
  getMapping(StorageKeys.R128GAIN_MAPPING);

/**
 * @deprecated
 * migrated to SQL based solutions.
 */
export const saveR128GainMapping = (val: NoxStorage.R128Dict) =>
  saveChucked(StorageKeys.R128GAIN_MAPPING, Object.entries(val));

/**
 * @deprecated
 * migrated to SQL based solutions.
 */
export const getABMapping = (): Promise<NoxStorage.ABDict> =>
  getMapping(StorageKeys.ABREPEAT_MAPPING);

/**
 * @deprecated
 * migrated to SQL based solutions.
 */
export const saveABMapping = async (val: NoxStorage.ABDict) =>
  saveChucked(StorageKeys.ABREPEAT_MAPPING, Object.entries(val));

export const getDefaultSearch = (): Promise<SearchOptions> =>
  getItem(StorageKeys.DEFAULT_SEARCH, SearchOptions.BILIBILI);

export const saveDefaultSearch = (val: SearchOptions) =>
  saveItem(StorageKeys.DEFAULT_SEARCH, val);

export const getCachedMediaMapping = () =>
  getItem(StorageKeys.CACHED_MEDIA_MAPPING, []);

export const saveCachedMediaMapping = (val: any[]) =>
  saveItem(StorageKeys.CACHED_MEDIA_MAPPING, val);

// we keep the set-cookie header for noxplayer's remove personal search option
// TODO: security risk. move this to an encrypted storage.
export const addCookie = async (site: string, setHeader: string) => {
  return;
  // eslint-disable-next-line no-unreachable
  const cookies = (await getItem(StorageKeys.COOKIES)) || {};
  saveItem(StorageKeys.COOKIES, { ...cookies, [site]: setHeader });
};

export const removeCookie = async (site: string) => {
  const cookies = await getItem(StorageKeys.COOKIES, {});
  cookies[site] = [];
  saveItem(StorageKeys.COOKIES, cookies);
};

interface GetPlaylist {
  key: string;
  defaultPlaylist?: () => NoxMedia.Playlist;
  hydrateSongList?: boolean;
  throwOnNull?: boolean;
}

/**
 * note this method always return a playlist, if error occurs a dummy one is
 * returned.
 */
export const getPlaylist = async ({
  key,
  defaultPlaylist = dummyPlaylist,
  hydrateSongList = true,
  throwOnNull = false,
}: GetPlaylist): Promise<NoxMedia.Playlist> => {
  const dPlaylist = defaultPlaylist();
  const retrievedPlaylist = await getItem(key);
  if (throwOnNull && !retrievedPlaylist) {
    throw new Error(`[APMStorage] playlist ${key} not found. throwing...`);
  }
  try {
    return {
      ...dPlaylist,
      ...retrievedPlaylist,
      id: key,
      songList: hydrateSongList
        ? await getPlaylistSongList(retrievedPlaylist)
        : [],
    };
  } catch (e) {
    console.error(e);
  }
  return dPlaylist;
};

export const savePlayerSkins = async (skins: any[]) =>
  saveChucked(StorageKeys.SKINSTORAGE, skins);

export const getPlayerSkins = async () =>
  await loadChucked(await getItem(StorageKeys.SKINSTORAGE, []));

/**
 * @deprecated
 * migrated to SQL based solutions.
 */
export const saveLyricMapping = async (
  lyricMapping: Map<string, NoxMedia.LyricDetail>,
) => saveChucked(StorageKeys.LYRIC_MAPPING, Array.from(lyricMapping.entries()));

/**
 * @deprecated
 * migrated to SQL based solutions.
 */
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

export const delPlaylist = (playlistId: string, playlistIds: string[]) => {
  const playlistIds2 = [...playlistIds];
  playlistIds2.splice(playlistIds2.indexOf(playlistId), 1);
  _delPlaylist(playlistId);
  savePlaylistIds(playlistIds2);
  return playlistIds2;
};

export const savelastPlaylistId = (val: [string, string]) =>
  saveItem(StorageKeys.LAST_PLAY_LIST, val);

export const savePlayMode = (val: string) =>
  saveItem(StorageKeys.PLAYMODE_KEY, val);

export const saveLastPlayDuration = (val: number) =>
  saveItem(StorageKeys.LAST_PLAY_DURATION, val);

export const initPlayerObject = async (safeMode = false) => {
  const playerObject = {
    settings: {
      ...DefaultSetting,
      ...(await getItem(StorageKeys.PLAYER_SETTING_KEY, {})),
      ...OverrideSetting,
    },
    playlistIds: await getItem(StorageKeys.MY_FAV_LIST_KEY, []),
    playlists: {},
    lastPlaylistId: await getItem(StorageKeys.LAST_PLAY_LIST, ['NULL', 'NULL']),
    searchPlaylist: dummyPlaylist(
      i18n.t('PlaylistOperations.searchListName'),
      PlaylistTypes.Search,
    ),
    playbackMode: await getItem(
      StorageKeys.PLAYMODE_KEY,
      NoxRepeatMode.Shuffle,
    ),
    skin: await getItem(StorageKeys.SKIN, getDefaultTheme()),
    skins: (await getPlayerSkins()) || [],
    cookies: await getItem(StorageKeys.COOKIES, {}),
    lastPlayDuration: await getItem(StorageKeys.LAST_PLAY_DURATION, 0),
    colorScheme: await getColorScheme(),
    defaultSearchOptions: await getDefaultSearch(),
    AListCred: await getAlistCred(),
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

  await timeFunction(async () => {
    await Promise.all(
      playerObject.playlistIds.map(async id => {
        const retrievedPlaylist = await getPlaylistSQL({
          key: id,
          hydrateSongList: !playerObject.settings.memoryEfficiency,
        });
        if (retrievedPlaylist) playerObject.playlists[id] = retrievedPlaylist;
      }),
    );
  }, 'loading playlists');

  return playerObject;
};

const saveImportedPlaylist = async (playlists: any[]) => {
  for (const playlist of playlists) {
    if (!playlist) {
      return;
    }
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
  await importSQL(parsedContent[StorageKeys.SQL_PLACEHOLDER], {});
  // this is only for the old style: songList is still hydrated. here if they are NOT,
  // its the new style (SQL) and should skip
  await saveImportedPlaylist(
    parsedContent[StorageKeys.MY_FAV_LIST_KEY].map((val: string) => {
      const songList = parsedContent[`${val}-songList`];
      return songList
        ? {
            ...parsedContent[val],
            songList,
          }
        : undefined;
    }),
  );
  await savePlaylistIds(parsedContent[StorageKeys.MY_FAV_LIST_KEY]);
};

export const addImportedPlaylist = async (playlists: any[]) => {
  await saveImportedPlaylist(playlists);
  await savePlaylistIds(
    (await getItem(StorageKeys.MY_FAV_LIST_KEY)).concat(
      playlists.map(val => val.id),
    ),
  );
};

export const importPlayerContentRaw = async (parsedContent: any) => {
  const oldCache = await _importPlayerContentRaw(
    parsedContent,
    getCachedMediaMapping,
  );
  await saveCachedMediaMapping(oldCache);
  return initPlayerObject();
};
