import React, { useState } from 'react';
import { IconButton, Text, TextInput, ProgressBar } from 'react-native-paper';
import { View } from 'react-native';
import { searchBiliURLs } from '../../utils/BiliSearch';
import Song from '../../objects/SongInterface';
import { useNoxSetting } from '../../hooks/useSetting';

export default ({
  onSearched = (songs: Array<Song>) => console.log(songs),
}) => {
  const [searchVal, setSearchVal] = useState('');
  const searchProgress = useNoxSetting(state => state.searchBarProgress);
  const progressEmitter = useNoxSetting(
    state => state.searchBarProgressEmitter
  );
  const searchPlaylist = useNoxSetting(state => state.searchPlaylist);
  const setSearchPlaylist = useNoxSetting(state => state.setSearchPlaylist);
  const setCurrentPlaylist = useNoxSetting(state => state.setCurrentPlaylist);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const playerStyle = useNoxSetting(state => state.playerStyle);

  const handleSearch = async (val = searchVal) => {
    progressEmitter(100);
    const searchedResult = (await searchBiliURLs({
      input: val,
      progressEmitter,
      favList: [],
      useBiliTag: false,
      fastSearch: playerSetting.fastBiliSearch,
    })) as Array<Song>;
    onSearched(searchedResult);
    const newSearchPlaylist = {
      ...searchPlaylist,
      songList: searchedResult,
      subscribeUrl: val.includes('http') ? [val] : [],
    };
    setSearchPlaylist(newSearchPlaylist);
    setCurrentPlaylist(newSearchPlaylist);
  };

  return (
    <View style={{ width: '100%', height: 50 }}>
      <View style={{ flexDirection: 'row', width: '100%' }}>
        <TextInput
          style={{ flex: 5 }}
          label="Bilibili URL"
          value={searchVal}
          onChangeText={val => setSearchVal(val)}
          onSubmitEditing={() => handleSearch(searchVal)}
          selectTextOnFocus
        />
        <IconButton
          icon="search-web"
          onPress={() => handleSearch(searchVal)}
          size={30}
          // TODO: how to color the square?
          // borderColor: playerStyle.colors.surfaceVariant
          style={{}}
        />
      </View>
      <ProgressBar
        progress={Math.max(searchProgress, 0)}
        indeterminate={searchProgress === 1}
      />
    </View>
  );
};
