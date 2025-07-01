import * as React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from '../style';
import BiliSearchbar from './BiliSearch/BiliSearchbar';
import usePlaylist from './usePlaylistRN';
import SongList from './SongList/View';
import MenuSheet from './MenuSheet';
import { useNoxSetting } from '@stores/useApp';
import { useIsLandscape } from '@hooks/useOrientation';

const Playlist = () => {
  const isLandscape = useIsLandscape();
  const insets = useSafeAreaInsets();
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const usedPlaylist = usePlaylist(currentPlaylist);

  console.log(insets);
  return (
    <View
      style={[
        styles.contentContainer,
        { paddingTop: isLandscape ? insets.top / 2 : insets.top },
      ]}
    >
      <MenuSheet usedPlaylist={usedPlaylist} />
      <BiliSearchbar onSearched={() => usedPlaylist.scrollTo({ toIndex: 0 })} />
      <SongList usedPlaylist={usedPlaylist} />
    </View>
  );
};

export default Playlist;
