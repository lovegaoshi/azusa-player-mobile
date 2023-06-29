import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Snackbar from 'react-native-snackbar';
import { IconButton, Text } from 'react-native-paper';
import TrackPlayer from 'react-native-track-player';
import { Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { useNetInfo } from '@react-native-community/netinfo';

import { styles } from '../style';
import SongInfo from './SongInfo';
import { useNoxSetting } from '../../hooks/useSetting';
import SongMenu from './SongMenu';
import PlaylistInfo from './PlaylistInfo';
import PlaylistMenuButton from '../buttons/PlaylistMenuButton';
import { updateSubscribeFavList } from '../../utils/BiliSubscribe';
import { songlistToTracklist } from '../../objects/Playlist';
import { PLAYLIST_ENUMS } from '../../enums/Playlist';
import { syncFavlist } from '../../utils/Bilibili/bilifavOperate';

export default () => {
  const { t } = useTranslation();
  const setCurrentPlayingList = useNoxSetting(
    state => state.setCurrentPlayingList
  );
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
  const playlistRef = React.useRef<any>(null);
  const netInfo = useNetInfo();

  const resetSelected = (val = false) =>
    setSelected(Array(currentPlaylist.songList.length).fill(val));

  const toggleSelected = useCallback((index: number) => {
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
      someRows.filter(row =>
        row.name.toLowerCase().includes(searchstr.toLowerCase())
      )
  ) => {
    const reExtractions = [
      {
        regex: /parsed:(.+)/,
        process: (val: RegExpExecArray, someRows: Array<NoxMedia.Song>) =>
          someRows.filter(row => row.parsedName === val[1]),
      },
      {
        regex: /artist:(.+)/,
        process: (val: RegExpExecArray, someRows: Array<NoxMedia.Song>) =>
          someRows.filter(row => row.singer.includes(val[1])),
      },
      {
        regex: /album:(.+)/,
        process: (val: RegExpExecArray, someRows: Array<NoxMedia.Song>) =>
          someRows.filter(row => row.album?.includes(val[1])),
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
    /**
     * use zustand queue management implementation.
     * motivation: setQueue transfers a lot of track[] from js bridge to native which is costly.
     * solution:
     * 1. playSong no longer usse RNTP.setQueue; it instead clears the queue and only add the current song.
     * this is shown 2b very fast.
     * 2. Without exoplayer/RNTP managing the queue, zustand vanilla holds the queue information.
     * any queue manipulation happens in js which is fast to my needs.
     * 3. exoplayer/RNTP never natually play a song backwards. it only goes forward. whenever user
     * press back/previous song button, either button event or remotePRevious will be triggered.
     * the entire queue is reset again with only 1 song.
     * 4. RNTP no longer handles playmode other than repeat track. other than repeat track, it will
     * be repeat mode off. along with queue size = 1, this guarantees PlaybackQueueEnded to be fired
     * when the current song finished playback. this  will be the queue to zustand to insert the next
     * song from zustand saved queue.
     */

    if (song.id === currentPlayingId) return;
    await TrackPlayer.reset();
    const queuedSongList = playerSetting.keepSearchedSongListWhenPlaying
      ? currentRows
      : currentPlaylist.songList;
    setCurrentPlayingList({ ...currentPlaylist, songList: queuedSongList });
    setCurrentPlayingId(song.id);
    await TrackPlayer.add(songlistToTracklist([song]));
    TrackPlayer.play();
    return;
    /*
    // setQueue implementation
    const skipNPlay = async (index: number) => {
      await TrackPlayer.skip(index);
      await TrackPlayer.play();
    };

    const reloadPlaylistAndPlay = async () => {
      let tracks = songlistToTracklist(queuedSongList);
      if (playmode === NoxRepeatMode.SHUFFLE) {
        tracks = [...tracks].sort(() => Math.random() - 0.5);
      }
      // await TrackPlayer.setQueue(tracks);
      TrackPlayer.reset();
      const splicedTracks = chunkArray(tracks, 500);
      for (const splicedTrack of splicedTracks) {
        await TrackPlayer.add(splicedTrack);
      }
      await skipNPlay(tracks.findIndex(track => track.song.id === song.id));
    };

    setCurrentPlayingId(song.id);
    if (setCurrentPlayingList({ ...currentPlaylist, songList: currentRows })) {
      reloadPlaylistAndPlay();
    } else {
      const tracks = await TrackPlayer.getQueue();
      const trackIndex = tracks.findIndex(track => track.song?.id === song.id);
      if (trackIndex === -1) {
        await reloadPlaylistAndPlay();
      } else {
        await skipNPlay(trackIndex);
      }
    }
     */
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
      playlistRef.current.scrollToIndex({
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

  return (
    <View>
      <View style={[styles.topBarContainer, { top: 10 }]}>
        <PlaylistInfo
          search={searching}
          searchText={searchText}
          setSearchText={setSearchText}
          onPressed={() => scrollTo()}
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
      <View
        style={{
          ...styles.topBarContainer,
          flex: 4,
          // HACK: this should be justified as top bar and bottom bar all have a defined height.
          maxHeight: Dimensions.get('window').height - 250,
        }}
      >
        <FlashList
          ref={ref => (playlistRef.current = ref)}
          data={currentRows}
          renderItem={({ item, index }) => (
            <SongInfo
              item={item}
              index={index}
              currentPlaying={item.id === currentPlayingId}
              playSong={playSong}
              checking={checking}
              checkedList={selected}
              onChecked={() => toggleSelected(getSongIndex(item, index))}
              onLongPress={() => {
                setChecking(true);
                toggleSelected(getSongIndex(item, index));
              }}
              networkCellular={netInfo.type === 'cellular'}
            />
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
      />
    </View>
  );
};
