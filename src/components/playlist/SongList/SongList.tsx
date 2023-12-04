import React, { useEffect, useRef } from 'react';
import { View, BackHandler, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { IconButton } from 'react-native-paper';
import { useNetInfo } from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';

import { styles } from '../../style';
import SongInfo from './SongInfo';
import SongBackground from './SongBackground';
import { useNoxSetting } from '@stores/useApp';
import SongMenu from './SongMenu';
import PlaylistInfo from '../Info/PlaylistInfo';
import PlaylistMenuButton from '../Menu/PlaylistMenuButton';
import usePlaylist from '../usePlaylist';

const PlaylistList = () => {
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const {
    refreshPlaylist,
    refreshing,
    rows,
    selected,
    resetSelected,
    toggleSelected,
    toggleSelectedAll,
    shouldReRender,
    setShouldReRender,
    checking,
    setChecking,
    searching,
    setSearching,
    onBackPress,
    searchText,
    setSearchText,
    searchAndEnableSearch,
    getSongIndex,
    playSong,
  } = usePlaylist(currentPlaylist);
  const playlistShouldReRender = useNoxSetting(
    state => state.playlistShouldReRender
  );
  const playlistRef = useRef<FlashList<NoxMedia.Song>>(null);
  const netInfo = useNetInfo();

  const scrollTo = (toIndex = -1) => {
    const currentIndex =
      toIndex < 0
        ? currentPlaylist.songList.findIndex(
            song => song.id === currentPlayingId
          )
        : toIndex;
    if (currentIndex > -1) {
      playlistRef.current?.scrollToIndex({
        index: currentIndex,
        viewPosition: 0.5,
      });
    }
  };

  useEffect(() => {
    setShouldReRender(val => !val);
  }, [currentPlayingId, checking, playlistShouldReRender, netInfo.type]);

  useFocusEffect(
    React.useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }, [checking, setChecking, searching, setSearching])
  );

  return (
    <View style={stylesLocal.mainContainer}>
      <View style={[styles.topBarContainer, { top: 10 }]}>
        <PlaylistInfo
          search={searching}
          searchText={searchText}
          setSearchText={setSearchText}
          onPressed={() => scrollTo()}
          selected={selected}
          checking={checking}
        />
        <View style={stylesLocal.container}>
          {checking && (
            <IconButton
              icon="select-all"
              onPress={toggleSelectedAll}
              size={25}
            />
          )}
          <IconButton
            icon="select"
            onPress={() => setChecking(val => !val)}
            size={25}
            containerColor={
              checking
                ? playerStyle.customColors.playlistDrawerBackgroundColor
                : undefined
            }
          />
          <IconButton
            icon="magnify"
            onPress={() => setSearching(val => !val)}
            size={25}
            mode={searching ? 'contained' : undefined}
            containerColor={
              searching
                ? playerStyle.customColors.playlistDrawerBackgroundColor
                : undefined
            }
          />
          <PlaylistMenuButton disabled={checking} />
        </View>
      </View>
      <View style={stylesLocal.playlistContainer}>
        <FlashList
          ref={playlistRef}
          data={rows}
          renderItem={({ item, index }) => (
            <SongBackground song={item}>
              <SongInfo
                item={item}
                index={index}
                currentPlaying={item.id === currentPlayingId}
                playSong={playSong}
                checking={checking}
                checkedList={selected}
                onChecked={() => toggleSelected(getSongIndex(item, index))}
                onLongPress={() => {
                  toggleSelected(getSongIndex(item, index));
                  setChecking(true);
                }}
                networkCellular={netInfo.type === 'cellular'}
              />
            </SongBackground>
            // </Animated.View>
          )}
          keyExtractor={(item, index) => `${item.id}.${index}`}
          estimatedItemSize={58}
          extraData={shouldReRender}
          onRefresh={refreshPlaylist}
          refreshing={refreshing}
        />
      </View>
      <SongMenu
        checking={checking}
        checked={selected}
        resetChecked={resetSelected}
        handleSearch={searchAndEnableSearch}
        prepareForLayoutAnimationRender={() =>
          playlistRef.current?.prepareForLayoutAnimationRender()
        }
      />
    </View>
  );
};
const stylesLocal = StyleSheet.create({
  container: {
    flexDirection: 'row',
    bottom: 5,
    justifyContent: 'flex-end',
  },
  mainContainer: { flex: 1 },
  playlistContainer: {
    ...styles.topBarContainer,
    flex: 4,
  },
  songInfoBackgroundImg: { opacity: 0.5 },
  songInfoBackgroundBanner: { flex: 1 },
});

export default PlaylistList;
