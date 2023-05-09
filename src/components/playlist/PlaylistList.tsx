import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { styles } from '../style';
import { IconButton, Text } from 'react-native-paper';
import { Dimensions } from 'react-native';
import SongInfo from './SongInfo';
import { useNoxSetting } from '../../hooks/useSetting';
import SongMenu from './SongMenu';
import Song from '../../objects/SongInterface';
import PlaylistInfo from './PlaylistInfo';
import PlaylistMenuButton from '../buttons/PlaylistMenuButton';

/*
import Song, { dummySong } from '../../objects/SongInterface';
const DUMMYDATA = [...Array(1222).keys()].reduce(
  (accumulator, currentValue) => accumulator.concat(dummySong()),
  [] as Array<Song>
);
*/

export default () => {
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [checking, setChecking] = useState(false);
  const [searching, setSearching] = useState(false);
  const [shouldReRender, setShouldReRender] = useState(false);
  const [currentRows, setCurrentRows] = useState<Song[]>([]);
  const [searchText, setSearchText] = useState('');
  const playlistShouldReRender = useNoxSetting(
    state => state.playlistShouldReRender
  );

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
              checking={checking}
              checkedProp={selected[getSongIndex(item, index)]}
              onChecked={() => toggleSelected(getSongIndex(item, index))}
            />
          )}
          keyExtractor={item => item.id}
          estimatedItemSize={20}
          extraData={shouldReRender}
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
