import * as React from 'react';
import { View } from 'react-native';

import { styles } from '../style';
import BiliSearchbar from './BiliSearch/BiliSearchbar';
import SongList from './SongList/View';
import { useNoxSetting } from '@stores/useApp';

const Playlist = () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <View
      style={[
        styles.contentContainer,
        { backgroundColor: playerStyle.customColors.maskedBackgroundColor },
      ]}
    >
      <BiliSearchbar onSearched={console.log} />
      <SongList />
    </View>
  );
};

export default Playlist;
