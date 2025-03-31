/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ProgressBar } from 'react-native-paper';
import { View, StyleSheet, GestureResponderEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import ShareMenu, { ShareCallback } from 'react-native-share-menu';

import { NoxRoutes } from '@enums/Routes';
import { useNoxSetting } from '@stores/useApp';
import usePlayback from '@hooks/usePlayback';
import useBiliSearch from '@hooks/useBiliSearch';
import SearchMenu from './SearchMenu';
import logger from '@utils/Logger';
import { getIcon } from './Icons';
import AutoComplete from '@components/commonui/AutoComplete';
import BiliKwSuggest from '@utils/Bilibili/BiliKwSuggest';
import { SearchOptions } from '@enums/Storage';
import { isAndroid } from '@utils/RNUtils';
import useNavigation from '@hooks/useNavigation';

interface SharedItem {
  mimeType: string;
  data: string;
  extraData: any;
}

const searchSuggest = (option: SearchOptions | string) => {
  switch (option) {
    case SearchOptions.BILIBILI:
      return BiliKwSuggest;
    default:
      return;
  }
};

interface Props {
  onSearched: (val: NoxMedia.SearchPlaylist) => void;
}
export default ({ onSearched = console.log }: Props) => {
  const { t } = useTranslation();
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const searchOption = useNoxSetting(state => state.searchOption);
  const searchProgress = useNoxSetting(state => state.searchBarProgress);
  const mfsdks = useNoxSetting(state => state.MFsdks);
  const navigationGlobal = useNavigation();
  const externalSearchText = useNoxSetting(state => state.externalSearchText);
  const setExternalSearchText = useNoxSetting(
    state => state.setExternalSearchText,
  );
  const miniPlayerCollapse = useNoxSetting(state => state.collapse);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sharedData, setSharedData] = useState<any>(null);
  const [, setSharedMimeType] = useState<string | null>(null);
  const { playFromPlaylist } = usePlayback();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<NoxTheme.Coordinates>({
    x: 0,
    y: 0,
  });
  const [showMusicFree, setShowMusicFree] = useState(false);
  const { searchVal, setSearchVal, handleSearch } = useBiliSearch({
    onSearched,
    searchListTitle: t('PlaylistOperations.searchListName'),
  });
  const pressed = useRef(false);

  const handleMenuPress = (event: GestureResponderEvent) => {
    setShowMusicFree(mfsdks.length > 0);
    toggleVisible();
    setMenuCoords({
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    });
  };

  const toggleVisible = () => {
    setDialogOpen(val => !val);
  };

  const handleExternalSearch = (data: string) => {
    navigationGlobal.navigate({
      route: NoxRoutes.PlayerHome,
      options: { screen: NoxRoutes.Playlist },
    });
    miniPlayerCollapse();
    return handleSearch(data);
  };

  useEffect(() => {
    if (externalSearchText.length > 0) {
      logger.debug(
        `[search] performing external serach: ${externalSearchText}`,
      );
      handleExternalSearch(externalSearchText).then(newSearchPlaylist =>
        playFromPlaylist({
          playlist: newSearchPlaylist,
          song: newSearchPlaylist.songList[0],
        }),
      );
      setExternalSearchText('');
    }
  }, [externalSearchText]);

  const handleShare = useCallback((item?: SharedItem) => {
    if (!item) {
      return;
    }

    const { mimeType, data } = item;
    if (data === sharedData) return;
    setSharedData(data);
    setSharedMimeType(mimeType);
    // You can receive extra data from your custom Share View
    handleExternalSearch(data);
    setSearchVal(data);
  }, []);

  const performSearch = (v = searchVal) => {
    pressed.current = true;
    handleSearch(v);
  };

  useEffect(() => {
    if (!isAndroid) return;
    ShareMenu.getInitialShare(handleShare as ShareCallback);
  }, []);

  useEffect(() => {
    if (!isAndroid) return;
    const listener = ShareMenu.addNewShareListener(
      handleShare as ShareCallback,
    );

    return () => {
      listener.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <AutoComplete
          pressed={pressed}
          placeholder={t('BiliSearchBar.label')}
          value={searchVal}
          setValue={setSearchVal}
          onSubmit={performSearch}
          onIconPress={handleMenuPress}
          icon={getIcon(searchOption)}
          resolveData={searchSuggest(
            playerSetting.useSuggestion ? searchOption : '',
          )}
        />
        <SearchMenu
          visible={dialogOpen}
          toggleVisible={toggleVisible}
          menuCoords={menuCoords}
          showMusicFree={showMusicFree}
          setSearchVal={v => {
            setSearchVal(v);
            handleSearch(v);
          }}
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
  progressBar: { backgroundColor: 'rgba(0, 0, 0, 0)' },
});
