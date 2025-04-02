import React, { useEffect } from 'react';
import { View, BackHandler, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { IconButton } from 'react-native-paper';
import { useNetInfo } from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';
import { useSharedValue } from 'react-native-reanimated';

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

export default () => {
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const songListScrollCounter = useNoxSetting(s => s.songListScrollCounter);
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
  const scrollViewHeight = useSharedValue(0);
  const scrollBarPosition = useSharedValue(0);
  const contentHeight = useSharedValue(0);

  useEffect(
    () => scrollTo({ toIndex: -1, reset: true }),
    [songListScrollCounter],
  );

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
    <View style={styles.flex}>
      <View style={[styles.topBarContainer, { top: 10 }]}>
        <PlaylistInfo
          onPressed={() => scrollTo({ viewPosition: 0.5 })}
          usePlaylist={usedPlaylist}
        />
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
        scrollBarPosition={scrollBarPosition}
        scrollViewHeight={scrollViewHeight}
        contentHeight={contentHeight}
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
          onScroll={({
            nativeEvent: { contentOffset, contentSize, layoutMeasurement },
          }) => {
            const contentH = contentSize.height - layoutMeasurement.height;
            scrollBarPosition.value = contentOffset.y / contentH;
            scrollViewHeight.value = layoutMeasurement.height;
            contentHeight.value = contentH;
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
  playlistContainer: {
    ...styles.topBarContainer,
    flex: 4,
  },
  songInfoBackgroundImg: { opacity: 0.5 },
  songInfoBackgroundBanner: { flex: 1 },
});
