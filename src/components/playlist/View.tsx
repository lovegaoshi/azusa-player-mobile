import * as React from 'react';
import { View } from 'react-native';

import { styles } from '../style';
import BiliSearchbar from './BiliSearch/BiliSearchbar';
import SongList from './SongList/SongList';
import { useNoxSetting } from '@stores/useApp';
import FlexView from '@components/commonui/FlexViewNewArch';

const Playlist = () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <FlexView>
      <View
        style={[
          styles.contentContainer,
          { backgroundColor: playerStyle.customColors.maskedBackgroundColor },
        ]}
      >
        <BiliSearchbar
          onSearched={(songs: NoxMedia.Song[]) => console.log(songs)}
        />
        <SongList />
      </View>
    </FlexView>
  );
};

export default Playlist;
