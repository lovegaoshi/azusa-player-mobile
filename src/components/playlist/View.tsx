import * as React from 'react';
import { View } from 'react-native';

import { styles } from '../style';
import BiliSearchbar from './BiliSearch/BiliSearchbar';
import usePlaylist from './usePlaylistRN';
import SongList from './SongList/View';
import { useNoxSetting } from '@stores/useApp';

const Playlist = () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const usedPlaylist = usePlaylist(currentPlaylist);

  return (
    <View
      style={[
        styles.contentContainer,
        { backgroundColor: playerStyle.customColors.maskedBackgroundColor },
      ]}
    >
      <BiliSearchbar onSearched={() => usedPlaylist.scrollTo({ toIndex: 0 })} />
      <SongList usedPlaylist={usedPlaylist} />
    </View>
  );
};

export default Playlist;
