/* eslint-disable @typescript-eslint/no-explicit-any */
import i18n from 'i18next';

import {
  saveItem,
  getItem,
  getMapping,
  saveChucked,
  loadChucked,
  savePlaylist,
  delPlaylist as _delPlaylist,
  importPlayerContentRaw as _importPlayerContentRaw,
  getColorScheme,
  getPlaylistSongList,
  getRegExtractMapping as _getRegExtractMapping,
  getDefaultTheme,
} from '@utils/ChromeStorageAPI';
import { dummyPlaylist, dummyPlaylistList } from '@objects/Playlist';
import { NoxRepeatMode } from '@enums/RepeatMode';
import { PlaylistTypes } from '@enums/Playlist';
import { StorageKeys, SearchOptions } from '@enums/Storage';
import { DefaultSetting, OverrideSetting } from '@objects/Storage';
import { getAlistCred } from './alist/storage';
import { timeFunction } from './Utils';

export const getFadeInterval = async () =>
  Number(await getItem(StorageKeys.FADE_INTERVAL)) || 0;

export const saveFadeInterval = async (val: number) =>
  await saveItem(StorageKeys.FADE_INTERVAL, val);

export const getRegExtractMapping = async (): Promise<
  NoxRegExt.JSONExtractor[]
> =>
  (await _getRegExtractMapping()) ??
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
  const retrievedPlaylist = await getItem(key);
  try {
    return {
      ...dPlaylist,
      ...retrievedPlaylist,
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

export const saveLyricMapping = async (
  lyricMapping: Map<string, NoxMedia.LyricDetail>,
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

export const initPlayerObject = async (safeMode = false) => {
  const lyricMapping = (await getLyricMapping()) || {};
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
    favoriPlaylist: await getPlaylist({
      key: StorageKeys.FAVORITE_PLAYLIST_KEY,
      defaultPlaylist: () => dummyPlaylist('Favorite', PlaylistTypes.Favorite),
    }),
    playbackMode: await getItem(
      StorageKeys.PLAYMODE_KEY,
      NoxRepeatMode.Shuffle,
    ),
    skin: await getItem(StorageKeys.SKIN, getDefaultTheme()),
    skins: (await getPlayerSkins()) || [],
    cookies: await getItem(StorageKeys.COOKIES, {}),
    lyricMapping,
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
  playerObject.playlists[StorageKeys.FAVORITE_PLAYLIST_KEY] =
    playerObject.favoriPlaylist;

  await timeFunction(async () => {
    await Promise.all(
      playerObject.playlistIds.map(async id => {
        const retrievedPlaylist = await getPlaylist({
          key: id,
          hydrateSongList: !playerObject.settings.memoryEfficiency,
        });
        if (retrievedPlaylist) playerObject.playlists[id] = retrievedPlaylist;
      }),
    );
  }, 'loading playlists');

  return playerObject;
};

export const clearPlaylists = async () => {
  const playlistIds = await getItem(StorageKeys.MY_FAV_LIST_KEY, []);
  savePlaylistIds([]);
  return playlistIds.map(_delPlaylist);
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
    parsedContent[StorageKeys.MY_FAV_LIST_KEY].map((val: string) => ({
      ...parsedContent[val],
      songList: parsedContent[`${val}-songList`],
    })),
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
