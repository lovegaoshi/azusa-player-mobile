import React, { useEffect } from 'react';
import { View, BackHandler, StyleSheet, NativeScrollEvent } from 'react-native';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { IconButton } from 'react-native-paper';
import { useNetInfo } from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  AnimateProps,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import { styles } from '@components/style';
import SongInfo from './SongInfo';
import SongBackground from './SongBackground';
import { useNoxSetting } from '@stores/useApp';
import SongMenu from './SongMenu';
import PlaylistInfo from '../Info/PlaylistInfo';
import PlaylistMenuButton from '../Menu/PlaylistMenuButton';
import usePlaylist from '../usePlaylistRN';
import SongListScrollbar from './SongListScrollbar';
import { LegendExample, ScrollProps } from './ScrollBarLegend';
import keepAwake from '@utils/keepAwake';

const AnimatedFlashList = Animated.createAnimatedComponent(
  FlashList,
) as React.ComponentClass<AnimateProps<FlashListProps<NoxMedia.Song>>, any>;

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
  const scrollPosition = useSharedValue(0);
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

  const scrollBarOnScroll = ({
    contentOffset,
    contentSize,
    layoutMeasurement,
  }: NativeScrollEvent) => {
    const contentH = Math.max(1, contentSize.height - layoutMeasurement.height);
    scrollPosition.value = contentOffset.y / contentH;
    scrollViewHeight.value = layoutMeasurement.height;
    contentHeight.value = contentH;
  };

  const ScrollLegend = (p: ScrollProps) => (
    <LegendExample
      {...p}
      data={rows}
      index={visibleIndex}
      processData={(v: any) => v?.parsedName?.[0] ?? ''}
    />
  );
  const scrollHandler = useAnimatedScrollHandler(scrollBarOnScroll);
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
        scrollViewHeight={scrollViewHeight}
        contentHeight={contentHeight}
        LegendContent={ScrollLegend}
      >
        <AnimatedFlashList
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
          onViewableItemsChanged={({ viewableItems }) => {
            visibleIndex.value = viewableItems[0]?.index ?? -1;
          }}
          viewabilityConfig={{
            viewAreaCoveragePercentThreshold: 50,
          }}
          onScroll={scrollHandler}
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
