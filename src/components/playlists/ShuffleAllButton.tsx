import React from 'react';
import { IconButton } from 'react-native-paper';
import TrackPlayer from 'react-native-track-player';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '../../hooks/useSetting';
import { songlistToTracklist } from '../../objects/Playlist';
import { randomChoice } from '../../utils/Utils';
import { ViewEnum } from '../../enums/View';
import { STORAGE_KEYS } from '../../utils/ChromeStorage';

export default () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const playlists = useNoxSetting(state => state.playlists);
  const playlistIds = useNoxSetting(state => state.playlistIds);
  const setCurrentPlayingList = useNoxSetting(
    state => state.setCurrentPlayingList
  );
  const setCurrentPlayingId = useNoxSetting(state => state.setCurrentPlayingId);

  const shuffleAll = async () => {
    await TrackPlayer.reset();
    const allSongs = playlistIds.reduce(
      (acc, curr) => acc.concat(playlists[curr].songList),
      [] as NoxMedia.Song[]
    );
    setCurrentPlayingList({
      ...playlists[STORAGE_KEYS.SEARCH_PLAYLIST_KEY],
      title: String(t('PlaylistOperations.all')),
      songList: allSongs,
    });
    const song = randomChoice(allSongs);
    setCurrentPlayingId(song.id);
    await TrackPlayer.add(songlistToTracklist([song]));
    TrackPlayer.play();
    navigation.navigate(ViewEnum.PLAYER_HOME as never);
  };

  return <IconButton icon="shuffle" onPress={shuffleAll} />;
};
