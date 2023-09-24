import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  BackHandler,
  StyleSheet,
  Dimensions,
  ImageBackground,
  StyleProp,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Snackbar from 'react-native-snackbar';
import { IconButton } from 'react-native-paper';
import TrackPlayer, { RepeatMode } from 'react-native-track-player';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { useNetInfo } from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';

import { styles } from '../style';
import SongInfo from './SongInfo';
import { useNoxSetting } from '@hooks/useSetting';
import SongMenu from './SongMenu';
import PlaylistInfo from './PlaylistInfo';
import PlaylistMenuButton from '../buttons/PlaylistMenuButton';
import { updateSubscribeFavList } from '@utils/BiliSubscribe';
import { PLAYLIST_ENUMS, SearchRegex } from '@enums/Playlist';
import { syncFavlist } from '@utils/Bilibili/bilifavOperate';
import noxCache, { noxCacheKey } from '@utils/Cache';
import noxPlayingList from '@stores/playingList';
import { NoxRepeatMode } from '@enums/RepeatMode';
import { i0hdslbHTTPResolve } from '@utils/Utils';
import { songlistToTracklist } from '@utils/RNTPUtils';

const { getState } = noxPlayingList;

interface BackgroundProps {
  song: NoxMedia.Song;
  current?: boolean;
  children: React.JSX.Element;
}
const SongBackground = (props: BackgroundProps) => {
  return props.current ? (
    <ImageBackground
      source={{ uri: i0hdslbHTTPResolve(props.song.cover) }}
      resizeMode="cover"
      style={stylesLocal.songInfoBackgroundBanner}
      imageStyle={stylesLocal.songInfoBackgroundImg}
    >
      {props.children}
    </ImageBackground>
  ) : (
    props.children
  );
};

interface Props {
  playlistViewStyle?: StyleProp<View>;
}

const PlaylistList = ({ playlistViewStyle }: Props) => {
  const { t } = useTranslation();
  const setCurrentPlayingList = useNoxSetting(
    state => state.setCurrentPlayingList
  );
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setCurrentPlayingId = useNoxSetting(state => state.setCurrentPlayingId);
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const playlistShouldReRender = useNoxSetting(
    state => state.playlistShouldReRender
  );
  const progressEmitter = useNoxSetting(
    state => state.searchBarProgressEmitter
  );
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);

  const [selected, setSelected] = useState<boolean[]>([]);
  const [checking, setChecking] = useState(false);
  const [searching, setSearching] = useState(false);
  const [shouldReRender, setShouldReRender] = useState(false);
  const [currentRows, setCurrentRows] = useState<NoxMedia.Song[]>([]);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText] = useDebounce(searchText, 500);
  const [refreshing, setRefreshing] = useState(false);
  const playlistRef = useRef<FlashList<NoxMedia.Song> | null>(null);
  const netInfo = useNetInfo();
  // TODO: slow?
  const [cachedSongs, setCachedSongs] = useState<string[]>([]);
  const togglePlaylistInfoUpdate = useNoxSetting(
    state => state.togglePlaylistInfoUpdate
  );

  const resetSelected = (val = false) =>
    setSelected(Array(currentPlaylist.songList.length).fill(val));

  const toggleSelected = useCallback((index: number) => {
    togglePlaylistInfoUpdate();
    setSelected((val: boolean[]) => {
      val[index] = !val[index];
      return val;
    });
  }, []);

  const toggleSelectedAll = () => {
    const mapCheckedIndices = (selectedIndices: number[], checked = true) => {
      setSelected(
        Array(currentPlaylist.songList.length)
          .fill(false)
          .map((val, index) =>
            selectedIndices.includes(index) ? checked : val
          )
      );
    };

    if (selected.length === 0) return;
    if (currentRows === currentPlaylist.songList) {
      selected[0] ? resetSelected() : resetSelected(true);
    } else {
      // TODO: there has to be a more elegant way
      // but alas it works!
      const selectedIndices = currentRows.map(val =>
        currentPlaylist.songList.indexOf(val)
      );
      mapCheckedIndices(selectedIndices, !selected[selectedIndices[0]]);
    }
    setShouldReRender(val => !val);
  };

  const reParseSearch = (
    searchStr: string,
    rows: Array<NoxMedia.Song>,
    defaultExtract = (someRows: Array<NoxMedia.Song>, searchstr: string) =>
      someRows.filter(
        row =>
          row.name.toLowerCase().includes(searchstr.toLowerCase()) ||
          row.singer.includes(searchstr) ||
          row.album?.includes(searchstr)
      )
  ) => {
    const reExtractions = [
      {
        regex: SearchRegex.absoluteMatch.regex,
        process: (val: RegExpExecArray, someRows: Array<NoxMedia.Song>) =>
          someRows.filter(row => row.parsedName === val[1]),
      },
      {
        regex: SearchRegex.artistMatch.regex,
        process: (val: RegExpExecArray, someRows: Array<NoxMedia.Song>) =>
          someRows.filter(row => row.singer.includes(val[1])),
      },
      {
        regex: SearchRegex.albumMatch.regex,
        process: (val: RegExpExecArray, someRows: Array<NoxMedia.Song>) =>
          someRows.filter(row => row.album?.includes(val[1])),
      },
      {
        regex: SearchRegex.cachedMatch.regex,
        process: (val: RegExpExecArray, someRows: Array<NoxMedia.Song>) =>
          someRows.filter(row => cachedSongs.includes(noxCacheKey(row))),
      },
    ];
    let defaultExtraction = true;
    for (const searchSubStr of searchStr.split('|')) {
      for (const reExtraction of reExtractions) {
        const extracted = reExtraction.regex.exec(searchSubStr);
        if (extracted !== null) {
          rows = reExtraction.process(extracted, rows);
          defaultExtraction = false;
          break;
        }
      }
    }
    // if none matches, treat as a generic search, check if any field contains the search string
    if (defaultExtraction) {
      rows = defaultExtract(rows, searchStr);
    }
    return rows;
  };

  const handleSearch = (searchedVal = '') => {
    if (searchedVal === '') {
      setCurrentRows(currentPlaylist.songList);
      return;
    }
    setCurrentRows(reParseSearch(searchedVal, currentPlaylist.songList));
  };

  /**
   * get a given song item/index combo used in flashlist's accurate index,
   * as currentRows may be at a filtered view and the index will not be reliable.
   * @param item
   * @param index
   * @returns
   */
  const getSongIndex = (item: NoxMedia.Song, index: number) => {
    return currentRows === currentPlaylist.songList
      ? index
      : currentPlaylist.songList.findIndex(row => row.id === item.id);
  };

  const searchAndEnableSearch = (val: string) => {
    setSearchText(val);
    setSearching(true);
  };

  const playSong = async (song: NoxMedia.Song) => {
    if (
      song.id === currentPlayingId &&
      currentPlaylist.id === currentPlayingList.id
    )
      return;
    if (getState().playmode === NoxRepeatMode.REPEAT_TRACK) {
      await TrackPlayer.setRepeatMode(RepeatMode.Off);
    }
    await TrackPlayer.reset();
    const queuedSongList = playerSetting.keepSearchedSongListWhenPlaying
      ? currentRows
      : currentPlaylist.songList;
    setCurrentPlayingList({ ...currentPlaylist, songList: queuedSongList });
    setCurrentPlayingId(song.id);
    await TrackPlayer.add(await songlistToTracklist([song]));
    TrackPlayer.play();
    return;
  };

  const refreshPlaylist = async () => {
    if (currentPlaylist.type !== PLAYLIST_ENUMS.TYPE_TYPICA_PLAYLIST) {
      return;
    }
    Snackbar.show({
      text: t('PlaylistOperations.updating', { playlist: currentPlaylist }),
      duration: Snackbar.LENGTH_INDEFINITE,
    });
    setRefreshing(true);
    await updateSubscribeFavList({
      listObj: currentPlaylist,
      progressEmitter,
      updatePlaylist,
    });
    Snackbar.dismiss();
    Snackbar.show({
      text: t('PlaylistOperations.updated', { playlist: currentPlaylist }),
    });
    setRefreshing(false);
  };

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
    if (
      playerSetting.autoRSSUpdate &&
      currentPlaylist.type === PLAYLIST_ENUMS.TYPE_TYPICA_PLAYLIST &&
      currentPlaylist.subscribeUrl.length > 0 &&
      currentPlaylist.subscribeUrl[0].length > 0 &&
      new Date().getTime() - currentPlaylist.lastSubscribed > 86400000
    ) {
      refreshPlaylist().then(() => {
        if (currentPlaylist.biliSync) {
          syncFavlist(currentPlaylist);
        }
      });
    }
  }, [currentPlaylist]);

  /**
   * playlistShouldReRender is a global state that indicates playlist should be
   * refreshed. right now its only called when the playlist is updated in updatePlaylist.
   * this should in turn clear all searching, checking and filtering.
   */
  useEffect(() => {
    resetSelected();
    setChecking(false);
    setSearching(false);
    setCurrentRows(currentPlaylist.songList);
    setCachedSongs(Array.from(noxCache.noxMediaCache.cache.keys()));
  }, [currentPlaylist, playlistShouldReRender]);

  useEffect(() => handleSearch(debouncedSearchText), [debouncedSearchText]);

  useEffect(() => {
    setShouldReRender(val => !val);
  }, [currentPlayingId, checking, playlistShouldReRender, netInfo.type]);

  useEffect(() => {
    if (!searching) {
      setSearchText('');
    }
  }, [searching]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (checking) {
          setChecking(false);
          return true;
        }
        if (searching) {
          setSearching(false);
          return true;
        }
        return false;
      };

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
          ref={ref => (playlistRef.current = ref)}
          data={currentRows}
          renderItem={({ item, index }) => (
            <SongBackground
              song={item}
              current={
                playerSetting.trackCoverArtCard && item.id === currentPlayingId
              }
            >
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
