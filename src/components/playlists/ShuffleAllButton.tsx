import React from 'react';
import { IconButton } from 'react-native-paper';
import TrackPlayer from 'react-native-track-player';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from 'hooks/useSetting';
import { songlistToTracklist } from 'objects/Playlist';
import { randomChoice } from '@utils/Utils';
import { ViewEnum } from 'enums/View';

export default () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const playlists = useNoxSetting(state => state.playlists);
  const playlistIds = useNoxSetting(state => state.playlistIds);
  const searchPlaylist = useNoxSetting(state => state.searchPlaylist);
  const setCurrentPlayingList = useNoxSetting(
    state => state.setCurrentPlayingList
  );
  const setCurrentPlayingId = useNoxSetting(state => state.setCurrentPlayingId);
  const setCurrentPlaylist = useNoxSetting(state => state.setCurrentPlaylist);
  const setSearchPlaylist = useNoxSetting(state => state.setSearchPlaylist);

  const shuffleAll = async () => {
    await TrackPlayer.reset();
    const allSongs = playlistIds.reduce(
      (acc, curr) => acc.concat(playlists[curr].songList),
      [] as NoxMedia.Song[]
    );
    const newSearchPlaylist = {
      ...searchPlaylist,
      title: String(t('PlaylistOperations.all')),
      songList: allSongs,
    };
    setSearchPlaylist(newSearchPlaylist);
    setCurrentPlayingList(newSearchPlaylist);
    const song = randomChoice(allSongs);
    setCurrentPlayingId(song.id);
    await TrackPlayer.add(songlistToTracklist([song]));
    TrackPlayer.play();
    navigation.navigate(ViewEnum.PLAYER_HOME as never);
    setCurrentPlaylist(newSearchPlaylist);
  };

  return <IconButton icon="shuffle" onPress={shuffleAll} />;
};
