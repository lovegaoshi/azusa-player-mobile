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

import { PLAYLIST_ENUMS, SearchRegex } from '@enums/Playlist';
import usePlaylist from '@hooks/usePlaylist';
import logger from '@utils/Logger';

export default (playlist: NoxMedia.Playlist) => {
  const { t } = useTranslation();
  const usedPlaylist = usePlaylist(playlist);
  const { setRefreshing, rssUpdate } = usedPlaylist;

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

  return {
    ...usedPlaylist,
    refreshPlaylist,
  };
};
