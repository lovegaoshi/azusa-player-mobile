import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Snackbar from 'react-native-snackbar';
import { IconButton, Text } from 'react-native-paper';
import TrackPlayer from 'react-native-track-player';
import { Dimensions } from 'react-native';
import { styles } from '../style';
import SongInfo from './SongInfo';
import { useNoxSetting } from '../../hooks/useSetting';
import SongMenu from './SongMenu';
import Song from '../../objects/SongInterface';
import PlaylistInfo from './PlaylistInfo';
import PlaylistMenuButton from '../buttons/PlaylistMenuButton';
import { updateSubscribeFavList } from '../../utils/BiliSubscribe';
import { songlistToTracklist } from '../../objects/Playlist';
import { NoxRepeatMode } from '../player/enums/repeatMode';
import { PLAYLIST_ENUMS } from '../../enums/Playlist';

/*
import Song, { dummySong } from '../../objects/SongInterface';
const DUMMYDATA = [...Array(1222).keys()].reduce(
  (accumulator, currentValue) => accumulator.concat(dummySong()),
  [] as Array<Song>
);
*/

export default () => {
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const playmode = useNoxSetting(state => state.playerRepeat); // performance drain?
  const setCurrentPlayingList = useNoxSetting(
    state => state.setCurrentPlayingList
  );
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const playerSetting = useNoxSetting(state => state.playerSetting);
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
  const [currentRows, setCurrentRows] = useState<Song[]>([]);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const resetSelected = (val = false) =>
    setSelected(Array(currentPlaylist.songList.length).fill(val));

  const toggleSelected = useCallback((index: number) => {
    setSelected((val: boolean[]) => {
      val[index] = !val[index];
      return val;
    });
  }, []);

  const toggleSelectedAll = () => {
    if (selected.length === 0) return;
    if (selected[0]) resetSelected();
    else resetSelected(true);
    setShouldReRender(val => !val);
  };

  const reParseSearch = (
    searchStr: string,
    rows: Array<Song>,
    defaultExtract = (someRows: Array<Song>, searchstr: string) =>
      someRows.filter(row =>
        row.name.toLowerCase().includes(searchstr.toLowerCase())
      )
  ) => {
    const reExtractions = [
      {
        regex: /parsed:(.+)/,
        process: (val: RegExpExecArray, someRows: Array<Song>) =>
          someRows.filter(row => row.parsedName === val[1]),
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

  // TODO: useDebunce here
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
  const getSongIndex = (item: Song, index: number) => {
    if (currentRows !== currentPlaylist.songList) {
      return currentPlaylist.songList.findIndex(row => row.id === item.id);
    }
    return index;
  };

  const searchAndEnableSearch = (val: string) => {
    setSearchText(val);
    setSearching(true);
  };

  // TODO: useCallback? [currentPlaylist, currentPlayingList, playMode, index]
  // TODO: can i somehow shove most of these into an async promise, then
  // use a boolean flag to make a loading screen?
  const playSong = async (song: Song) => {
    const skipNPlay = (index: number) => {
      TrackPlayer.skip(index).then(() => TrackPlayer.play());
    };

    const reloadPlaylistAndPlay = () => {
      let tracks = songlistToTracklist(
        playerSetting.keepSearchedSongListWhenPlaying
          ? currentRows
          : currentPlaylist.songList
      );
      if (playmode === NoxRepeatMode.SHUFFLE) {
        tracks = [...tracks].sort(() => Math.random() - 0.5);
      }
      TrackPlayer.setQueue(tracks).then(() =>
        skipNPlay(tracks.findIndex(track => track.song.id === song.id))
      );
    };

    setCurrentPlayingId(song.id);
    if (currentPlaylist.id !== currentPlayingList) {
      setCurrentPlayingList(currentPlaylist.id);
      reloadPlaylistAndPlay();
    } else {
      TrackPlayer.getQueue().then(tracks => {
        const trackIndex = tracks.findIndex(track => track.song.id === song.id);
        if (trackIndex === -1) {
          reloadPlaylistAndPlay();
        } else {
          skipNPlay(trackIndex);
        }
      });
    }
  };

  const refreshPlaylist = async () => {
    Snackbar.show({
      text: `正在更新歌单 ${currentPlaylist.title}……`,
      duration: Snackbar.LENGTH_INDEFINITE,
    });
    setRefreshing(true);
    await updateSubscribeFavList({
      listObj: currentPlaylist,
      progressEmitter,
      updatePlaylist,
    });
    Snackbar.dismiss();
    Snackbar.show({ text: `歌单 ${currentPlaylist.title} updated` });
    setRefreshing(false);
  };

  useEffect(() => {
    if (
      playerSetting.autoRSSUpdate &&
      currentPlaylist.type === PLAYLIST_ENUMS.TYPE_TYPICA_PLAYLIST &&
      currentPlaylist.subscribeUrl.length > 0 &&
      currentPlaylist.subscribeUrl[0].length > 0 &&
      new Date().getTime() - currentPlaylist.lastSubscribed > 86400000
    ) {
      refreshPlaylist();
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
  }, [currentPlaylist, playlistShouldReRender]);

  // TODO: use debunceValue
  useEffect(() => handleSearch(searchText), [searchText]);

  useEffect(() => {
    setShouldReRender(val => !val);
  }, [currentPlayingId, checking, playlistShouldReRender]);

  useEffect(() => {
    if (!searching) {
      setSearchText('');
    }
  }, [searching]);

  return (
    <View>
      <View style={[styles.topBarContainer, { top: 10 }]}>
        <PlaylistInfo
          search={searching}
          searchText={searchText}
          setSearchText={setSearchText}
        />
        <View
          style={{
            flexDirection: 'row',
            flex: 3,
            bottom: 5,
            justifyContent: 'flex-end',
          }}
        >
          {checking && (
            <IconButton
              icon="select-all"
              onPress={toggleSelectedAll}
              size={25}
            />
          )}
          <IconButton
            icon="playlist-edit"
            onPress={() => setChecking(val => !val)}
            size={25}
          />
          <IconButton
            icon="magnify"
            onPress={() => setSearching(val => !val)}
            size={25}
            mode={searching ? 'contained' : undefined}
          />
          <PlaylistMenuButton />
        </View>
      </View>
      <View
        style={{
          ...styles.topBarContainer,
          flex: 4,
          // HACK: this should be justified as top bar and bottom bar all have a defined height.
          maxHeight: Dimensions.get('window').height - 250,
        }}
      >
        <FlashList
          data={currentRows}
          renderItem={({ item, index }) => (
            <SongInfo
              item={item}
              index={index}
              currentPlaying={item.id === currentPlayingId}
              playSong={playSong}
              checking={checking}
              checkedProp={selected[getSongIndex(item, index)]}
              onChecked={() => toggleSelected(getSongIndex(item, index))}
            />
          )}
          keyExtractor={item => item.id}
          estimatedItemSize={20}
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
      />
    </View>
  );
};
