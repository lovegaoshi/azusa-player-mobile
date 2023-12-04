import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, BackHandler, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Snackbar from 'react-native-snackbar';
import { IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { useNetInfo } from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { useNoxSetting } from '@stores/useApp';
import { PLAYLIST_ENUMS, SearchRegex } from '@enums/Playlist';
import usePlaylist from '@hooks/usePlaylist';
import logger from '@utils/Logger';

export default (playlist: NoxMedia.Playlist) => {
  const { t } = useTranslation();
  const [shouldReRender, setShouldReRender] = useState(false);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [checking, setChecking] = useState(false);
  const togglePlaylistInfoUpdate = useNoxSetting(
    state => state.togglePlaylistInfoUpdate
  );
  const usedPlaylist = usePlaylist(playlist);
  const { setRefreshing, rssUpdate, rows } = usedPlaylist;

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
  };
};
