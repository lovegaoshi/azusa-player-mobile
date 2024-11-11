import React, { useEffect, useState } from 'react';
import { View, BackHandler, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { IconButton, Text } from 'react-native-paper';
import { useNetInfo } from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';

import { styles } from '@components/style';
import SongInfo from './SongInfo';
import SongBackground from './SongBackground';
import { useNoxSetting } from '@stores/useApp';
import SongMenu from './SongMenu';
import PlaylistInfo from '../Info/PlaylistInfo';
import PlaylistMenuButton from '../Menu/PlaylistMenuButton';
import usePlaylist from '../usePlaylistRN';
import SongListScrollbar from './SongListScrollbar';
import keepAwake from '@utils/keepAwake';

const PlaylistList = () => {
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const songListScrollCounter = useNoxSetting(
    state => state.songListScrollCounter,
  );
  const usedPlaylist = usePlaylist(currentPlaylist);
  const {
    refreshPlaylist,
    refreshing,
    rows,
    setRows,
    toggleSelected,
    toggleSelectedAll,
    shouldReRender,
    checking,
    setChecking,
    searching,
    setSearching,
    onBackPress,
    getSongIndex,
    scrollTo,
    playlistRef,
  } = usedPlaylist;
  const netInfo = useNetInfo();
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [contentViewHeight, setContentViewHeight] = useState(0);
  const [scrollPositionY, setScrollPositionY] = useState(0);

  useEffect(() => scrollTo(-1, true), [songListScrollCounter]);

  useFocusEffect(
    React.useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [checking, setChecking, searching, setSearching]),
  );

  const btnContainColor =
    playerStyle.colors.primaryContainer ??
    playerStyle.customColors.playlistDrawerBackgroundColor;

  return (
    <View style={stylesLocal.mainContainer}>
      <View style={[styles.topBarContainer, { top: 10 }]}>
        <PlaylistInfo onPressed={() => scrollTo()} usePlaylist={usedPlaylist} />
        <View style={stylesLocal.container}>
          {checking && (
            <IconButton
              icon="select-all"
              onPress={toggleSelectedAll}
              size={25}
              //iconColor={playerStyle.colors.primary}
            />
          )}
          <IconButton
            icon="select"
            onPress={() => setChecking(val => !val)}
            size={25}
            containerColor={checking ? btnContainColor : undefined}
            //iconColor={playerStyle.colors.primary}
          />
          <IconButton
            icon="magnify"
            onPress={() => setSearching(val => !val)}
            size={25}
            mode={searching ? 'contained' : undefined}
            containerColor={searching ? btnContainColor : undefined}
            //iconColor={playerStyle.colors.primary}
          />
          <PlaylistMenuButton
            disabled={checking}
            playlist={currentPlaylist}
            songListUpdateHalt={() => setRows([])}
          />
        </View>
      </View>
      <SongListScrollbar
        style={stylesLocal.playlistContainer}
        scrollViewReference={playlistRef}
        scrollViewHeight={scrollViewHeight}
        contentViewHeight={contentViewHeight}
        scrollPositionY={scrollPositionY}
      >
        <FlashList
          ref={playlistRef}
          data={rows}
          renderItem={({ item, index }) => (
            <SongBackground song={item}>
              <SongInfo
                item={item}
                index={index}
                currentPlaying={item.id === currentPlayingId}
                usePlaylist={usedPlaylist}
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
          onRefresh={() => keepAwake(refreshPlaylist)}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
          onLayout={({
            nativeEvent: {
              layout: { height },
            },
          }) => {
            setScrollViewHeight(height);
          }}
          onContentSizeChange={(_, contentHeight) => {
            setContentViewHeight(contentHeight);
          }}
          onScroll={({ nativeEvent: { contentOffset, contentSize } }) => {
            setScrollPositionY(contentOffset.y);
            setContentViewHeight(contentSize.height);
          }}
        />
        <SongMenu
          usePlaylist={usedPlaylist}
          prepareForLayoutAnimationRender={() =>
            playlistRef.current?.prepareForLayoutAnimationRender()
          }
        />
      </SongListScrollbar>
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
