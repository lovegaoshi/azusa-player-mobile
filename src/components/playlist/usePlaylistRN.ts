import { useState, useEffect } from 'react';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { useNetInfo } from '@react-native-community/netinfo';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { AnimatedRef, useAnimatedRef } from 'react-native-reanimated';
import TrackPlayer, { State } from 'react-native-track-player';

import { useNoxSetting } from '@stores/useApp';
import { PlaylistTypes, SearchRegex } from '@enums/Playlist';
import usePlaylist, { UsePlaylist } from '@hooks/usePlaylist';
import noxCache, { noxCacheKey } from '@utils/Cache';
import { reParseSearch as reParseSearchRaw } from '@utils/re';
import { syncFavlist } from '@utils/Bilibili/bilifavOperate';
import usePlayback from '@hooks/usePlayback';
import useTPControls from '@hooks/useTPControls';
import useSnack from '@stores/useSnack';
import {
  clearPlaylistUninterrupted,
  cycleThroughPlaymode,
} from '@utils/RNTPUtils';
import { execWhenTrue } from '@utils/Utils';
import playlistStore, { initializePlaybackMode } from '@stores/playingList';
import { TPPlay } from '@stores/RNObserverStore';

interface ScrollTo {
  toIndex?: number;
  reset?: boolean;
  viewPosition?: number; // toIndex = -1, reset = false, viewPosition = -4
}

export default (playlist: NoxMedia.Playlist): UsePlaylistRN => {
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
  const toggleMiniplayerVisible = useNoxSetting(
    state => state.toggleMiniplayerVisible,
  );
  const playlistRef = useAnimatedRef<FlashList<NoxMedia.Song>>();
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
    toggleMiniplayerVisible();
    const playSongCallback = (playlist: NoxMedia.Playlist) => {
      const setPlaylistPlaymode = () =>
        cycleThroughPlaymode(
          initializePlaybackMode(
            playlist.repeatMode ?? playlistStore.getState().playmodeGlobal,
            false,
          ),
        );
      const callback = () =>
        playFromPlaylist({ playlist, song }).then(setPlaylistPlaymode);
      if (song.id === currentPlayingId) {
        callback();
        return;
      }
      performFade(callback);
    };
    usedPlaylist.playSong(song, playSongCallback, p => {
      clearPlaylistUninterrupted().then(() => setCurrentPlayingList(p));
      TrackPlayer.getPlaybackState().then(s => {
        s.state !== State.Playing && TPPlay();
      });
    });
  };

  const scrollTo = ({
    toIndex = -1,
    reset = false,
    viewPosition,
  }: ScrollTo) => {
    let currentIndex =
      toIndex < 0
        ? playlist.songList.findIndex(song => song.id === currentPlayingId)
        : toIndex;
    if (currentIndex === -1 && reset) currentIndex = 0;
    if (currentIndex > -1) {
      execWhenTrue({
        funcName: 'playlist index priming',
        executeFn: () =>
          playlistRef.current?.scrollToIndex({
            index: currentIndex,
            viewPosition:
              (viewPosition ??
              (playlistRef.current?.getWindowSize?.()?.height ?? 0) > 0)
                ? 0.5
                : -5,
            animated: false,
          }),
        loopCheck: async () => {
          if (
            playlist.songList.length === 0 ||
            playlistRef?.current?.getLayout(0) !== undefined
          )
            return true;
          return false;
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
      setTimeout(() => scrollTo({}), 1);
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

export interface UsePlaylistRN extends UsePlaylist {
  refreshPlaylist: () => Promise<void>;
  cachedSongs: string[];
  setCachedSongs: (val: string[]) => void;
  handleSearch: (searchedVal: string) => void;
  playSong: (song: NoxMedia.Song) => void;
  scrollTo: ({ toIndex, reset, viewPosition }: ScrollTo) => void;
  playlistRef: AnimatedRef<FlashList<NoxMedia.Song>>;
}
