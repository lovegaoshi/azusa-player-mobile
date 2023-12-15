import React, { useState } from 'react';
import { View, BackHandler, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { IconButton } from 'react-native-paper';
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

const PlaylistList = () => {
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const usedPlaylist = usePlaylist(currentPlaylist);
  const {
    refreshPlaylist,
    refreshing,
    rows,
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
  const [completeScrollBarHeight, setCompleteScrollBarHeight] = useState(1);
  const [visibleScrollBarHeight, setVisibleScrollBarHeight] = useState(0.5);

  const scrollIndicatorSize =
    completeScrollBarHeight > visibleScrollBarHeight
      ? (visibleScrollBarHeight * visibleScrollBarHeight) /
        completeScrollBarHeight
      : visibleScrollBarHeight;

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
        <PlaylistInfo onPressed={() => scrollTo()} usePlaylist={usedPlaylist} />
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
          <PlaylistMenuButton disabled={checking} playlist={currentPlaylist} />
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
          onRefresh={refreshPlaylist}
          refreshing={refreshing}
        />
        <View
          style={{
            height: '100%',
            width: 6,
            //backgroundColor: '#52057b',
            borderRadius: 8,
          }}
        >
          <View
            style={{
              height: '99%',
              width: 6,
              //backgroundColor: '#52057b',
              borderRadius: 8,
            }}
          >
            <View
              style={{
                width: 6,
                borderRadius: 8,
                backgroundColor: 'white',
                height: '50%',
              }}
            />
          </View>
        </View>
      </View>
      <SongMenu
        usePlaylist={usedPlaylist}
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
