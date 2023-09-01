import React, { useState, useEffect, useCallback } from 'react';
import { ProgressBar, Searchbar } from 'react-native-paper';
import {
  View,
  StyleSheet,
  GestureResponderEvent,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import ShareMenu, { ShareCallback } from 'react-native-share-menu';
import { useNavigation } from '@react-navigation/native';

import { ViewEnum } from '@enums/View';
import { searchBiliURLs } from '@utils/BiliSearch';
import { useNoxSetting } from '@hooks/useSetting';
import usePlayback from '@hooks/usePlayback';
import SearchMenu from './SearchMenu';
import { getDefaultSearch, getMusicFreePlugin } from '@utils/ChromeStorage';
import logger from '@utils/Logger';

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
  const externalSearchText = useNoxSetting(state => state.externalSearchText);
  const setExternalSearchText = useNoxSetting(
    state => state.setExternalSearchText
  );
  const [sharedData, setSharedData] = useState<any>(null);
  const [sharedMimeType, setSharedMimeType] = useState<string | null>(null);
  const { playFromPlaylist } = usePlayback();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<NoxTheme.coordinates>({
    x: 0,
    y: 0,
  });
  const [showMusicFree, setShowMusicFree] = useState(false);

  const handleMenuPress = async (event: GestureResponderEvent) => {
    setShowMusicFree((await getMusicFreePlugin()).length > 0);
    setDialogOpen(true);
    setMenuCoords({
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    });
  };

  const toggleVisible = () => {
    setDialogOpen(val => !val);
  };

  const handleExternalSearch = async (data: string, play = false) => {
    navigationGlobal.navigate(ViewEnum.PLAYER_PLAYLIST as never);
    await handleSearch(data, play);
  };

  useEffect(() => {
    if (externalSearchText.length > 0) {
      logger.debug(
        `[search] performing external serach: ${externalSearchText}`
      );
      handleExternalSearch(externalSearchText, true);
      setExternalSearchText('');
    }
  }, [externalSearchText]);

  const handleShare = useCallback((item?: SharedItem) => {
    if (!item) {
      return;
    }

    const { mimeType, data, extraData } = item;

    setSharedData(data);
    setSharedMimeType(mimeType);
    // You can receive extra data from your custom Share View
    handleExternalSearch(data);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    ShareMenu.getInitialShare(handleShare as ShareCallback);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const listener = ShareMenu.addNewShareListener(
      handleShare as ShareCallback
    );

    return () => {
      listener.remove();
    };
  }, []);

  const handleSearch = async (val = searchVal, play = false) => {
    progressEmitter(100);
    const searchedResult = (await searchBiliURLs({
      input: val,
      progressEmitter,
      favList: [],
      useBiliTag: false,
      fastSearch: playerSetting.fastBiliSearch,
      defaultSearch: await getDefaultSearch(),
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
    if (play) {
      playFromPlaylist(newSearchPlaylist, newSearchPlaylist.songList[0]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={String(t('BiliSearchBar.label'))}
          value={searchVal}
          onChangeText={setSearchVal}
          onSubmitEditing={() => handleSearch(searchVal)}
          selectTextOnFocus
          style={styles.textInput}
          selectionColor={playerStyle.customColors.textInputSelectionColor}
          onIconPress={handleMenuPress}
        />
        <SearchMenu
          visible={dialogOpen}
          toggleVisible={toggleVisible}
          menuCoords={menuCoords}
          showMusicFree={showMusicFree}
        />
      </View>
      <ProgressBar
        progress={Math.max(searchProgress, 0)}
        indeterminate={searchProgress === 1}
        style={styles.progressBar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 60,
    paddingHorizontal: 5,
    paddingTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  textInput: {
    flex: 5,
  },
  progressBar: { backgroundColor: 'rgba(0, 0, 0, 0)' },
});
