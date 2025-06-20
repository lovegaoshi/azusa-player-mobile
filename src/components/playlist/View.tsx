import * as React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from '../style';
import BiliSearchbar from './BiliSearch/BiliSearchbar';
import usePlaylist from './usePlaylistRN';
import SongList from './SongList/View';
import MenuSheet from './MenuSheet';
import { useNoxSetting } from '@stores/useApp';

const Playlist = () => {
  const insets = useSafeAreaInsets();
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const usedPlaylist = usePlaylist(currentPlaylist);

  return (
    <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
      <MenuSheet usedPlaylist={usedPlaylist} />
      <BiliSearchbar onSearched={() => usedPlaylist.scrollTo({ toIndex: 0 })} />
      <SongList usedPlaylist={usedPlaylist} />
    </View>
  );
};

export default Playlist;
