import React, { useEffect } from 'react';
import { View, BackHandler, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSharedValue } from 'react-native-reanimated';

import { styles } from '@components/style';
import { useNoxSetting } from '@stores/useApp';
import { UsePlaylistRN } from '../usePlaylistRN';
import SongListScrollbar from './SongListScrollbar';
import { LegendExample, LegendProps } from './ScrollBarLegend';
import SongList from './SongList';
import Animatedheader from '@components/commonui/ReanimatedHeader';
import Header from './SongListHeader';

interface Props {
  usedPlaylist: UsePlaylistRN;
}

export default ({ usedPlaylist }: Props) => {
  const songListScrollCounter = useNoxSetting(s => s.songListScrollCounter);
  const {
    rows,
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
      <Animatedheader
        Header={() => <Header usedPlaylist={usedPlaylist} />}
        Content={({ onScroll }) => (
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
              onScroll={onScroll}
            />
          </SongListScrollbar>
        )}
      />
    </View>
  );
};
const stylesLocal = StyleSheet.create({
  playlistContainer: {
    ...styles.topBarContainer,
    flex: 4,
  },
  songInfoBackgroundImg: { opacity: 0.5 },
  songInfoBackgroundBanner: { flex: 1 },
});
