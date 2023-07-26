import * as React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { styles } from '../style';
import BiliSearchbar from './BiliSearchbar';
import PlaylistList from './PlaylistList';
import { useNoxSetting } from 'hooks/useSetting';

const Playlist = () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <SafeAreaView style={playerStyle.screenContainer}>
      <View
        style={[
          styles.contentContainer,
          { backgroundColor: playerStyle.customColors.maskedBackgroundColor },
        ]}
      >
        <BiliSearchbar
          onSearched={(songs: Array<NoxMedia.Song>) => console.log(songs)}
        />
        <PlaylistList />
      </View>
    </SafeAreaView>
  );
};

export default Playlist;
