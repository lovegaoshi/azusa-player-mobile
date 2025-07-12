import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NativeScrollEvent } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNetInfo } from '@react-native-community/netinfo';
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from 'react-native-gesture-handler';

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
  onScroll?: (e: NativeScrollEvent) => void;
}

export default ({
  usedPlaylist,
  scrollPosition,
  scrollOffset,
  scrollViewHeight,
  contentHeight,
  onScroll,
}: Props) => {
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const netInfo = useNetInfo();
  const initialDragY = useSharedValue(0);
  const translationDragY = useSharedValue(0);
  const initialDragOffset = useSharedValue(0);
  const scrollingRef = React.useRef<NodeJS.Timeout | null>(null);
  const dragPos = useSharedValue(0);
  const dragToSelect = useSharedValue(0);
  const [scrollActive, setScrollActive] = useState(0);
  const acceleration = useSharedValue(0);
  const cursorOffset = useDerivedValue(
    () => initialDragY.value + translationDragY.value + scrollOffset.value,
  );
  const layoutY = React.useRef<number[]>([]);

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

  const scrollBarOnScroll = (p: NativeScrollEvent) => {
    const contentH = Math.max(
      1,
      p.contentSize.height - p.layoutMeasurement.height,
    );
    scrollPosition.value = p.contentOffset.y / contentH;
    scrollOffset.value = p.contentOffset.y;
    scrollViewHeight.value = p.layoutMeasurement.height;
    contentHeight.value = contentH;
    onScroll?.(p);
  };
  const scrollHandler = useAnimatedScrollHandler(scrollBarOnScroll);

  const scrollDragGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(checking)
        .activateAfterLongPress(500)
        .onStart(e => {
          initialDragY.value = e.y;
          translationDragY.value = 0;
          initialDragOffset.value = scrollOffset.value + e.y;
        })
        .onChange(e => {
          dragToSelect.value = 1;
          translationDragY.value = e.translationY;
          const cursorPos =
            (e.translationY + initialDragY.value) / scrollViewHeight.value;
          const scrollDown = cursorPos > 0.8;
          dragPos.value = cursorPos;
          const scrollUp = cursorPos < 0.2;
          if (scrollDown) {
            runOnJS(setScrollActive)(1);
          } else if (scrollUp) {
            runOnJS(setScrollActive)(2);
          } else {
            runOnJS(setScrollActive)(0);
          }
        })
        .onFinalize(() => {
          dragToSelect.value = 0;
          initialDragY.value = 0;
          translationDragY.value = 0;
          runOnJS(setScrollActive)(0);
        }),
    [checking],
  );

  useEffect(() => {
    scrollingRef.current && clearInterval(scrollingRef.current);
    if (scrollActive === 2) {
      scrollingRef.current = setInterval(() => {
        playlistRef.current?.scrollToOffset({
          offset: scrollOffset.value - acceleration.value,
          animated: false,
        });
        if (dragPos.value < 0.2) {
          acceleration.value = Math.min(acceleration.value + 0.5, 50);
        }
      }, 16);
    } else if (scrollActive === 1) {
      scrollingRef.current = setInterval(() => {
        playlistRef.current?.scrollToOffset({
          offset: scrollOffset.value + acceleration.value,
          animated: false,
        });
        if (dragPos.value > 0.8) {
          acceleration.value = Math.min(acceleration.value + 0.5, 50);
        }
      }, 16);
    }
    return () => {
      scrollingRef.current && clearInterval(scrollingRef.current);
      acceleration.value = 0;
    };
  }, [scrollActive]);

  const getLayoutY = useCallback(
    (index: number) => {
      if (layoutY.current[index] === undefined) {
        const layout = playlistRef.current?.getLayout(index);
        layoutY.current[index] = (layout?.y ?? 0) + (layout?.height ?? 0);
      }
      return layoutY.current[index];
    },
    [rows],
  );

  const nativeGesture = useMemo(() => Gesture.Native(), []);

  const pullUpActivated = useSharedValue(0);
  const pullUpDistance = useSharedValue(0);
  const pullUpRefreshGesture = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          console.log(
            'pullUpRefreshStart',
            scrollPosition.value,
            scrollOffset.value,
          );
          // if flashlist is at the very bottom, set pullupAct to 1
        })
        .onChange(e => console.log('pullUpRefresh', e))
        .onFinalize(() => {
          pullUpActivated.value = 0;
        }),
    [],
  );

  const composedGesture = Gesture.Simultaneous(
    scrollDragGesture,
    Gesture.Simultaneous(pullUpRefreshGesture, nativeGesture),
  );

  useEffect(() => {
    layoutY.current = [];
  }, [rows]);

  return (
    <GestureDetector gesture={composedGesture}>
      <AnimatedFlashList
        renderScrollComponent={ScrollView}
        overrideProps={{
          simultaneousHandlers: composedGesture,
        }}
        ref={playlistRef}
        data={rows}
        renderItem={({ item, index }) => (
          <SongBackground song={item}>
            <SongInfo
              dragToSelect={dragToSelect}
              getLayoutY={getLayoutY}
              cursorOffset={cursorOffset}
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
