import React, { useEffect } from 'react';
import { View, BackHandler, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useSharedValue } from 'react-native-reanimated';

import { styles } from '@components/style';
import { useNoxSetting } from '@stores/useApp';
import SongMenu from './SongMenu';
import PlaylistInfo from '../Info/PlaylistInfo';
import PlaylistMenuButton from '../Menu/PlaylistMenuButton';
import usePlaylist from '../usePlaylistRN';
import SongListScrollbar from './SongListScrollbar';
import { LegendExample, LegendProps } from './ScrollBarLegend';
import SongList from './SongList';

export default () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const songListScrollCounter = useNoxSetting(s => s.songListScrollCounter);
  const usedPlaylist = usePlaylist(currentPlaylist);
  const {
    rows,
    setRows,
    toggleSelectedAll,
    checking,
    setChecking,
    searching,
    setSearching,
    onBackPress,
    scrollTo,
    playlistRef,
  } = usedPlaylist;
  const scrollViewHeight = useSharedValue(0);
  const scrollPosition = useSharedValue(0);
  const scrollOffset = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const visibleIndex = useSharedValue(-1);

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

  const ScrollLegend = (p: LegendProps) => (
    <LegendExample
      {...p}
      data={rows}
      index={visibleIndex}
      processData={(v: any) => v?.parsedName ?? ''}
    />
  );

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
        scrollPosition={scrollPosition}
        scrollOffset={scrollOffset}
        scrollViewHeight={scrollViewHeight}
        contentHeight={contentHeight}
        LegendContent={ScrollLegend}
      >
        <SongList
          usedPlaylist={usedPlaylist}
          visibleIndex={visibleIndex}
          scrollPosition={scrollPosition}
          scrollOffset={scrollOffset}
          scrollViewHeight={scrollViewHeight}
          contentHeight={contentHeight}
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
