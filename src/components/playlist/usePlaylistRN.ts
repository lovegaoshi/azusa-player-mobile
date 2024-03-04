import { useState, useEffect, useRef } from 'react';
import { FlashList } from '@shopify/flash-list';
import Snackbar from 'react-native-snackbar';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { useNetInfo } from '@react-native-community/netinfo';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { useNoxSetting } from '@stores/useApp';
import { PLAYLIST_ENUMS, SearchRegex } from '@enums/Playlist';
import usePlaylist from '@hooks/usePlaylist';
import logger from '@utils/Logger';
import noxCache, { noxCacheKey } from '@utils/Cache';
import { reParseSearch as reParseSearchRaw } from '@utils/re';
import { syncFavlist } from '@utils/Bilibili/bilifavOperate';
import usePlayback from '@hooks/usePlayback';
import useTPControls from '@hooks/useTPControls';

export default (playlist: NoxMedia.Playlist) => {
  const { t } = useTranslation();
  const netInfo = useNetInfo();
  const usedPlaylist = usePlaylist(playlist);
  const {
    rssUpdate,
    setRows,
    searchText,
    searchAndEnableSearch,
    resetSelected,
    setChecking,
    setSearching,
    searching,
    setSearchText,
    setShouldReRender,
    checking,
  } = usedPlaylist;
  const [cachedSongs, setCachedSongs] = useState<string[]>([]);
  const [debouncedSearchText] = useDebounce(searchText, 500);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const setPlaylistSearchAutoFocus = useNoxSetting(
    state => state.setPlaylistSearchAutoFocus
  );
  const playlistShouldReRender = useNoxSetting(
    state => state.playlistShouldReRender
  );
  const progressEmitter = useNoxSetting(
    state => state.searchBarProgressEmitter
  );
  const playlistRef = useRef<FlashList<NoxMedia.Song>>(null);
  const { playFromPlaylist } = usePlayback();
  const { preformFade } = useTPControls();

  const refreshPlaylist = async () => {
    Snackbar.show({
      text: t('PlaylistOperations.updating', { playlist }),
      duration: Snackbar.LENGTH_INDEFINITE,
    });
    progressEmitter(100);
    activateKeepAwakeAsync();
    try {
      await rssUpdate();
    } catch (e) {
      logger.error('[refreshPlaylist] failed');
      logger.error(e);
    }
    Snackbar.dismiss();
    Snackbar.show({
      text: t('PlaylistOperations.updated', { playlist }),
    });
    progressEmitter(0);
    deactivateKeepAwake();
  };

  const reParseSearch = (searchStr: string, rows: Array<NoxMedia.Song>) => {
    const extraReExtract = [
      {
        regex: SearchRegex.cachedMatch.regex,
        process: (val: RegExpExecArray, someRows: Array<NoxMedia.Song>) =>
          someRows.filter(
            row =>
              // HACK: cachedSongs also include local files
              row.bvid.startsWith('file://') ||
              cachedSongs.includes(noxCacheKey(row))
          ),
      },
    ];
    return reParseSearchRaw({
      searchStr,
      rows,
      extraReExtract,
    });
  };

  const handleSearch = (searchedVal = '') => {
    if (searchedVal === '') {
      setRows(playlist.songList);
      return;
    }
    setRows(reParseSearch(searchedVal, playlist.songList));
  };

  const playSong = async (song: NoxMedia.Song) => {
    const playSongCallback = (p: NoxMedia.Playlist) => {
      const callback = () =>
        playFromPlaylist({
          playlist: p,
          song,
        });
      if (song.id === currentPlayingId) {
        callback();
        return;
      }
      // REVIEW: ideally playFromPlaylist should accept an async function to wait
      // for it, but performFade is not exactly functional on android (it replies
      // on an event to emit) so we have to do conditionals outside of playFromPlaylist.
      preformFade(callback);
    };
    usedPlaylist.playSong(song, playSongCallback);
  };

  const scrollTo = (toIndex = -1) => {
    const currentIndex =
      toIndex < 0
        ? playlist.songList.findIndex(song => song.id === currentPlayingId)
        : toIndex;
    if (currentIndex > -1) {
      playlistRef.current?.scrollToIndex({
        index: currentIndex,
        viewPosition: 0.5,
      });
    }
  };

  /**
   * playlistShouldReRender is a global state that indicates playlist should be
   * refreshed. right now its only called when the playlist is updated in updatePlaylist.
   * this should in turn clear all searching, checking and filtering.
   */
  useEffect(() => {
    resetSelected();
    setChecking(false);
    setSearching(false);
    setRows(playlist.songList);
    setCachedSongs(Array.from(noxCache.noxMediaCache.cache.keys()));
  }, [playlist, playlistShouldReRender]);

  useEffect(() => {
    if (
      playerSetting.autoRSSUpdate &&
      playlist.type === PLAYLIST_ENUMS.TYPE_TYPICA_PLAYLIST &&
      playlist.subscribeUrl.length > 0 &&
      playlist.subscribeUrl[0].length > 0 &&
      new Date().getTime() - playlist.lastSubscribed > 86400000
    ) {
      refreshPlaylist().then(() => {
        if (playlist.biliSync) {
          syncFavlist(playlist);
        }
      });
    }
    if (playerSetting.dataSaver && netInfo.type === 'cellular') {
      searchAndEnableSearch(SearchRegex.cachedMatch.text);
      handleSearch(SearchRegex.cachedMatch.text);
      setPlaylistSearchAutoFocus(false);
    }
  }, [playlist]);

  useEffect(() => handleSearch(debouncedSearchText), [debouncedSearchText]);

  useEffect(() => {
    if (!searching) {
      setSearchText('');
    }
  }, [searching]);

  useEffect(() => {
    setShouldReRender(val => !val);
  }, [currentPlayingId, checking, playlistShouldReRender, netInfo.type]);

  return {
    ...usedPlaylist,
    refreshPlaylist,
    cachedSongs,
    setCachedSongs,
    handleSearch,
    playSong,
    scrollTo,
    playlistRef,
  };
};
