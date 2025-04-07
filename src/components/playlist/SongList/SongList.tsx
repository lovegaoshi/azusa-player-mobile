import React from 'react';
import { NativeScrollEvent } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNetInfo } from '@react-native-community/netinfo';
import Animated, {
  SharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';

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
  scrollViewHeight: SharedValue<number>;
  contentHeight: SharedValue<number>;
}

export default ({
  usedPlaylist,
  visibleIndex,
  scrollPosition,
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
    scrollViewHeight.value = layoutMeasurement.height;
    contentHeight.value = contentH;
  };
  const scrollHandler = useAnimatedScrollHandler(scrollBarOnScroll);

  return (
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
  );
};
