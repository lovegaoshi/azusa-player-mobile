import * as React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { styles } from '../style';
import BiliSearchbar from './BiliSearchbar';
import Song from '../../objects/SongInterface';
import PlaylistList from './PlaylistList';
import { useNoxSetting } from '../../hooks/useSetting';

const Playlist = () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <SafeAreaView style={playerStyle.screenContainer}>
      <View style={styles.contentContainer}>
        <BiliSearchbar
          onSearched={(songs: Array<Song>) => console.log(songs)}
        />
        <PlaylistList />
      </View>
    </SafeAreaView>
  );
};

export default Playlist;
