import { useState, useEffect, useRef } from 'react';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { useNetInfo } from '@react-native-community/netinfo';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { useNoxSetting } from '@stores/useApp';
import { PlaylistTypes, SearchRegex } from '@enums/Playlist';
import usePlaylist from '@hooks/usePlaylist';
import noxCache, { noxCacheKey } from '@utils/Cache';
import { reParseSearch as reParseSearchRaw } from '@utils/re';
import { syncFavlist } from '@utils/Bilibili/bilifavOperate';
import usePlayback from '@hooks/usePlayback';
import useTPControls from '@hooks/useTPControls';
import useSnack from '@stores/useSnack';
import { clearPlaylistUninterrupted } from '@utils/RNTPUtils';
import { execWhenTrue } from '@utils/Utils';

interface ScrollTo {
  toIndex?: number;
  reset?: boolean;
  viewPosition?: number; // toIndex = -1, reset = false, viewPosition = -4
}

export default (playlist: NoxMedia.Playlist) => {
  const { t } = useTranslation();
  const setSnack = useSnack(state => state.setSnack);
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
    state => state.setPlaylistSearchAutoFocus,
  );
  const playlistShouldReRender = useNoxSetting(
    state => state.playlistShouldReRender,
  );
  const setCurrentPlayingList = useNoxSetting(
    state => state.setCurrentPlayingList,
  );
  const progressEmitter = useNoxSetting(
    state => state.searchBarProgressEmitter,
  );
  const playlistRef = useRef<FlashList<NoxMedia.Song>>(null);
  const { playFromPlaylist } = usePlayback();
  const { performFade } = useTPControls();

  const refreshPlaylist = () => {
    progressEmitter(100);
    activateKeepAwakeAsync();
    return setSnack({
      snackMsg: {
        processing: t('PlaylistOperations.updating', { playlist }),
        success: t('PlaylistOperations.updated', { playlist }),
        fail: '[refreshPlaylist] failed',
      },
      processFunction: rssUpdate,
      callback: () => {
        progressEmitter(0);
        deactivateKeepAwake();
      },
    });
  };

  const reParseSearch = (searchStr: string, rows: NoxMedia.Song[]) => {
    const extraReExtract = [
      {
        regex: SearchRegex.cachedMatch.regex,
        process: (val: RegExpExecArray, someRows: NoxMedia.Song[]) => {
          return val[1].startsWith('local')
            ? someRows.filter(row => row?.bvid?.startsWith?.('file://'))
            : someRows.filter(
                row =>
                  // HACK: cachedSongs also include local files
                  row?.bvid?.startsWith?.('file://') ||
                  cachedSongs.includes(noxCacheKey(row)),
              );
        },
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

  const playSong = (song: NoxMedia.Song) => {
    const playSongCallback = (playlist: NoxMedia.Playlist) => {
      const callback = () => playFromPlaylist({ playlist, song });
      if (song.id === currentPlayingId) {
        callback();
        return;
      }
      // REVIEW: ideally playFromPlaylist should accept an async function to wait
      // for it, but performFade is not exactly functional on android (it replies
      // on an event to emit) so we have to do conditionals outside of playFromPlaylist.
      performFade(callback);
    };
    usedPlaylist.playSong(song, playSongCallback, p =>
      clearPlaylistUninterrupted().then(() => setCurrentPlayingList(p)),
    );
  };

  const scrollTo = ({
    toIndex = -1,
    reset = false,
    viewPosition = 0.5,
  }: ScrollTo) => {
    let currentIndex =
      toIndex < 0
        ? playlist.songList.findIndex(song => song.id === currentPlayingId)
        : toIndex;
    if (currentIndex === -1 && reset) currentIndex = 0;
    let layoutHeightCheck = 0;
    if (currentIndex > -1) {
      execWhenTrue({
        funcName: 'playlist index priming',
        executeFn: () =>
          playlistRef.current?.scrollToIndex({
            index: currentIndex,
            viewPosition: viewPosition,
            animated: false,
          }),
        loopCheck: async () => {
          // @ts-expect-error detect if flashlist is rendered
          const layoutHeight = playlistRef?.current?.rlvRef._layout.height;
          if (layoutHeight < 1.1) {
            return false;
          }
          if (layoutHeightCheck !== layoutHeight) {
            layoutHeightCheck = layoutHeight;
            return false;
          }
          return true;
        },
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
      playlist.type === PlaylistTypes.Typical &&
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
