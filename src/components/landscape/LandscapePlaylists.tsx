import React from 'react';
import { FlatList } from 'react-native';

import { useNoxSetting } from '@hooks/useSetting';
import PlaylistItem from '../playlists/PlaylistItem';

export default () => {
  const playlistIds = useNoxSetting(state => state.playlistIds);

  return <FlatList />;
};
