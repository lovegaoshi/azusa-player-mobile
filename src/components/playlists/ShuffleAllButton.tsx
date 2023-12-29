import React from 'react';
import { IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';
import { ViewEnum } from '@enums/View';
import usePlayback from '@hooks/usePlayback';
import useDataSaver from '@hooks/useDataSaver';
import noxCache, { noxCacheKey } from '@utils/Cache';

export default () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const playlists = useNoxSetting(state => state.playlists);
  const playlistIds = useNoxSetting(state => state.playlistIds);
  const searchPlaylist = useNoxSetting(state => state.searchPlaylist);
  const setCurrentPlaylist = useNoxSetting(state => state.setCurrentPlaylist);
  const setSearchPlaylist = useNoxSetting(state => state.setSearchPlaylist);
  const { playFromPlaylist } = usePlayback();
  const { isDataSaving } = useDataSaver();
  const shuffleAll = async () => {
    let allSongs = playlistIds.reduce(
      (acc, curr) => acc.concat(playlists[curr].songList),
      [] as NoxMedia.Song[]
    );
    if (isDataSaving) {
      const cachedSongs = Array.from(noxCache.noxMediaCache.cache.keys());
      allSongs = allSongs.filter(song =>
        cachedSongs.includes(noxCacheKey(song))
      );
    }
    const newSearchPlaylist = {
      ...searchPlaylist,
      title: String(t('PlaylistOperations.all')),
      songList: allSongs,
    };
    setSearchPlaylist(newSearchPlaylist);
    await playFromPlaylist({ playlist: newSearchPlaylist });
    navigation.navigate(ViewEnum.PLAYER_HOME as never);
    setCurrentPlaylist(newSearchPlaylist);
  };

  return <IconButton icon="shuffle" onPress={shuffleAll} />;
};
