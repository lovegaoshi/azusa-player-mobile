import React, { useState, useEffect, useCallback } from 'react';
import { IconButton, Text, TextInput, ProgressBar } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ShareMenu, { ShareCallback } from 'react-native-share-menu';
import { useNavigation } from '@react-navigation/native';
import { ViewEnum } from '../../enums/View';

import { searchBiliURLs, matchBiliURL } from '../../utils/BiliSearch';
import { useNoxSetting } from '../../hooks/useSetting';

interface SharedItem {
  mimeType: string;
  data: string;
  extraData: any;
}

interface props {
  onSearched: (val: any) => void;
}
export default ({
  onSearched = (songs: Array<NoxMedia.Song>) => console.log(songs),
}: props) => {
  const { t } = useTranslation();
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
  const navigationGlobal = useNavigation();
  const [sharedData, setSharedData] = useState<any>(null);
  const [sharedMimeType, setSharedMimeType] = useState<string | null>(null);

  const handleShare = useCallback((item?: SharedItem) => {
    if (!item) {
      return;
    }

    const { mimeType, data, extraData } = item;

    setSharedData(data);
    setSharedMimeType(mimeType);
    // You can receive extra data from your custom Share View
    navigationGlobal.navigate(ViewEnum.PLAYER_PLAYLIST as never);
    handleSearch(data);
  }, []);

  useEffect(() => {
    ShareMenu.getInitialShare(handleShare as ShareCallback);
  }, []);

  useEffect(() => {
    const listener = ShareMenu.addNewShareListener(
      handleShare as ShareCallback
    );

    return () => {
      listener.remove();
    };
  }, []);

  const handleSearch = async (val = searchVal) => {
    progressEmitter(100);
    const searchedResult = (await searchBiliURLs({
      input: val,
      progressEmitter,
      favList: [],
      useBiliTag: false,
      fastSearch: playerSetting.fastBiliSearch,
    })) as Array<NoxMedia.Song>;
    onSearched(searchedResult);
    const newSearchPlaylist = {
      ...searchPlaylist,
      title: t('PlaylistOperations.searchListName'),
      songList: searchedResult,
      subscribeUrl: val.includes('http') ? [val] : [],
    };
    setSearchPlaylist(newSearchPlaylist);
    setCurrentPlaylist(newSearchPlaylist);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: playerStyle.colors.surfaceVariant },
        ]}
      >
        <TextInput
          style={styles.textInput}
          label={String(t('BiliSearchBar.label'))}
          value={searchVal}
          onChangeText={val => setSearchVal(val)}
          onSubmitEditing={() => handleSearch(searchVal)}
          selectTextOnFocus
          selectionColor={playerStyle.customColors.textInputSelectionColor}
          textColor={playerStyle.colors.text}
        />
        <IconButton
          icon="search-web"
          onPress={() => handleSearch(searchVal)}
          size={30}
        />
      </View>
      <ProgressBar
        progress={Math.max(searchProgress, 0)}
        indeterminate={searchProgress === 1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  textInput: {
    flex: 5,
  },
});
