import React, { useMemo, useState } from 'react';
import { NativeScrollEvent } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNetInfo } from '@react-native-community/netinfo';
import Animated, {
  SharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import SongInfo from './SongInfo';
import SongBackground from './SongBackground';
import { useNoxSetting } from '@stores/useApp';
import keepAwake from '@utils/keepAwake';
import { UsePlaylistRN } from '../usePlaylistRN';

const AnimatedFlashList = Animated.createAnimatedComponent(
  FlashList<NoxMedia.Song>,
);

interface Props {
  usedPlaylist: UsePlaylistRN;
  visibleIndex: SharedValue<number>;
  scrollPosition: SharedValue<number>;
  scrollOffset: SharedValue<number>;
  scrollViewHeight: SharedValue<number>;
  contentHeight: SharedValue<number>;
}

export default ({
  usedPlaylist,
  scrollPosition,
  scrollOffset,
  scrollViewHeight,
  contentHeight,
}: Props) => {
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const netInfo = useNetInfo();

  const {
    refreshPlaylist,
    refreshing,
    rows,
    toggleSelected,
    shouldReRender,
    checking,
    setChecking,
    getSongIndex,
    playlistRef,
  } = usedPlaylist;

  const scrollBarOnScroll = ({
    contentOffset,
    contentSize,
    layoutMeasurement,
  }: NativeScrollEvent) => {
    const contentH = Math.max(1, contentSize.height - layoutMeasurement.height);
    scrollPosition.value = contentOffset.y / contentH;
    scrollOffset.value = contentOffset.y;
    scrollViewHeight.value = layoutMeasurement.height;
    contentHeight.value = contentH;
  };
  const scrollHandler = useAnimatedScrollHandler(scrollBarOnScroll);
  const scrollDragGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(checking)
        .activateAfterLongPress(500)
        .onBegin(e => console.log('begin', e.y))
        .onChange(e => {
          console.log(e.changeY);
        }),
    [checking],
  );

  return (
    <GestureDetector gesture={scrollDragGesture}>
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
        onScroll={scrollHandler}
      />
    </GestureDetector>
  );
};
