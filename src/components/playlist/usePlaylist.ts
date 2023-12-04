import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [shouldReRender, setShouldReRender] = useState(false);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [cachedSongs, setCachedSongs] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText] = useDebounce(searchText, 500);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const setPlaylistSearchAutoFocus = useNoxSetting(
    state => state.setPlaylistSearchAutoFocus
  );
  const togglePlaylistInfoUpdate = useNoxSetting(
    state => state.togglePlaylistInfoUpdate
  );
  const playlistShouldReRender = useNoxSetting(
    state => state.playlistShouldReRender
  );
  const usedPlaylist = usePlaylist(playlist);
  const { setRefreshing, rssUpdate, rows, setRows } = usedPlaylist;
  const { playFromPlaylist } = usePlayback();
  const { preformFade } = useTPControls();

  const refreshPlaylist = async () => {
    if (playlist.type !== PLAYLIST_ENUMS.TYPE_TYPICA_PLAYLIST) {
      return;
    }
    Snackbar.show({
      text: t('PlaylistOperations.updating', { playlist }),
      duration: Snackbar.LENGTH_INDEFINITE,
    });
    setRefreshing(true);
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
    setRefreshing(false);
    deactivateKeepAwake();
  };

  const resetSelected = (val = false) =>
    setSelected(Array(playlist.songList.length).fill(val));

  const toggleSelected = useCallback((index: number) => {
    togglePlaylistInfoUpdate();
    setSelected((val: boolean[]) => {
      val[index] = !val[index];
      return val;
    });
  }, []);

  const toggleSelectedAll = () => {
    const mapCheckedIndices = (selectedIndices: number[], checked = true) => {
      setSelected(
        Array(playlist.songList.length)
          .fill(false)
          .map((val, index) =>
            selectedIndices.includes(index) ? checked : val
          )
      );
    };

    if (selected.length === 0) return;
    if (rows === playlist.songList) {
      selected[0] ? resetSelected() : resetSelected(true);
    } else {
      // TODO: there has to be a more elegant way
      // but alas it works!
      const selectedIndices = rows.map(val => playlist.songList.indexOf(val));
      mapCheckedIndices(selectedIndices, !selected[selectedIndices[0]]);
    }
    setShouldReRender(val => !val);
  };

  const reParseSearch = (searchStr: string, rows: Array<NoxMedia.Song>) => {
    const extraReExtract = [
      {
        regex: SearchRegex.cachedMatch.regex,
        process: (val: RegExpExecArray, someRows: Array<NoxMedia.Song>) =>
          someRows.filter(row => cachedSongs.includes(noxCacheKey(row))),
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

  const searchAndEnableSearch = (val: string) => {
    setSearchText(val);
    setSearching(true);
  };

  const onBackPress = () => {
    if (checking) {
      setChecking(false);
      return true;
    }
    if (searching) {
      setSearching(false);
      return true;
    }
    return false;
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

  useEffect(() => handleSearch(debouncedSearchText), [debouncedSearchText]);

  useEffect(() => {
    if (!searching) {
      setSearchText('');
    }
  }, [searching]);

  return {
    ...usedPlaylist,
    refreshPlaylist,
    selected,
    setSelected,
    resetSelected,
    toggleSelected,
    toggleSelectedAll,
    shouldReRender,
    setShouldReRender,
    checking,
    setChecking,
    searching,
    setSearching,
    cachedSongs,
    setCachedSongs,
    onBackPress,
    searchText,
    setSearchText,
    handleSearch,
    searchAndEnableSearch,
    playSong,
  };
};
