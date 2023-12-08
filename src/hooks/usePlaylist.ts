import React, { useState, useRef, useCallback, useEffect } from 'react';

import { reParseSearch } from '../utils/re';
import { useNoxSetting } from '../stores/useApp';
import usePlaylistCRUD from './usePlaylistCRUD';

export interface UsePlaylist {
  playlist: NoxMedia.Playlist;
  rows: NoxMedia.Song[];
  setRows: (v: NoxMedia.Song[]) => void;
  selected: boolean[];
  setSelected: (v: boolean[]) => void;
  checking: boolean;
  setChecking: React.Dispatch<React.SetStateAction<boolean>>;
  searching: boolean;
  setSearching: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchText: (v: string) => void;
  searchText: string;
  shouldReRender: boolean;
  setShouldReRender: React.Dispatch<React.SetStateAction<boolean>>;

  performSearch: (searchedVal: string) => void;
  handleSearch: (searchedVal: string) => void;
  rssUpdate: (subscribeUrls?: string[]) => Promise<NoxMedia.Playlist>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchBarRef: React.MutableRefObject<any>;
  refreshing: boolean;
  setRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
  getSongIndex: (item: NoxMedia.Song, index: number) => number;
  playSong: (
    song: NoxMedia.Song,
    callback: (p: NoxMedia.Playlist, s: NoxMedia.Song) => void
  ) => void;
  resetSelected: () => void;
  toggleSelected: (index: number) => void;
  toggleSelectedAll: () => void;
  searchAndEnableSearch: (searchedVal: string) => void;
  onBackPress: () => boolean;
  getSelectedSongs: () => NoxMedia.Song[] | undefined;
}

/**
 * use hook for the paginated fav view. has rows.
 * @param playlist
 * @returns
 */
const usePlaylist = (playlist: NoxMedia.Playlist): UsePlaylist => {
  const [rows, setRows] = useState<NoxMedia.Song[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [checking, setChecking] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [shouldReRender, setShouldReRender] = useState(false);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const setCurrentPlayingId = useNoxSetting(state => state.setCurrentPlayingId);
  const togglePlaylistInfoUpdate = useNoxSetting(
    state => state.togglePlaylistInfoUpdate
  );
  const playlistCRUD = usePlaylistCRUD(playlist);
  const searchBarRef = useRef();

  const handleSearch = (searchedVal: string) => {
    if (searchedVal === '') {
      setRows(playlist.songList);
      return;
    }
    setRows(reParseSearch({ searchStr: searchedVal, rows: playlist.songList }));
  };

  const rssUpdate = async (subscribeUrls?: string[]) => {
    setRefreshing(true);
    try {
      const result = await playlistCRUD.rssUpdate(subscribeUrls);
      setRefreshing(false);
      return result;
    } catch (e) {
      setRefreshing(false);
      throw e;
    }
  };
  /**
   * forcefully search a string in the playlist.
   * setting the searchbar ref's value directly is bugged with
   * the visual update of textfield's label; otherwise works just fine.
   * @param {string} searchedVal
   */
  const performSearch = (searchedVal: string) => {
    setTimeout(() => {
      if (searchBarRef.current) {
        // TODO: fix type
        // @ts-ignore
        searchBarRef.current.value = searchedVal;
      }
    }, 100);
    handleSearch(searchedVal);
  };

  /**
   * get a given song item/index combo used in flashlist's accurate index,
   * as currentRows may be at a filtered view and the index will not be reliable.
   * @param item
   * @param index
   * @returns
   */
  const getSongIndex = (item: NoxMedia.Song, index: number) => {
    return rows === playlist.songList
      ? index
      : playlist.songList.findIndex(row => row.id === item.id);
  };

  const playSong = (
    song: NoxMedia.Song,
    callback: (p: NoxMedia.Playlist, s: NoxMedia.Song) => void
  ) => {
    if (song.id === currentPlayingId && playlist.id === currentPlayingList.id)
      return;
    // HACK: more responsive, so the current song banner will show
    // immediately instead of watiting for fade to complete
    // REVIEW: playfromplaylist also checks currentPlayingId. how is that possible?
    setCurrentPlayingId(song.id);
    const queuedSongList = playerSetting.keepSearchedSongListWhenPlaying
      ? rows
      : playlist.songList;
    return callback({ ...playlist, songList: queuedSongList }, song);
  };

  const resetSelected = (val = false) =>
    setSelected(Array(playlist.songList.length).fill(val));

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
        Array(playlist.songList.length)
          .fill(false)
          .map((val, index) =>
            selectedIndices.includes(index) ? checked : val
          )
      );
    };

    if (selected.length === 0) return;
    if (rows === playlist.songList) {
      selected[0] ? resetSelected() : resetSelected(true);
    } else {
      // TODO: there has to be a more elegant way
      // but alas it works!
      const selectedIndices = rows.map(val => playlist.songList.indexOf(val));
      mapCheckedIndices(selectedIndices, !selected[selectedIndices[0]]);
    }
    setShouldReRender(val => !val);
  };

  const searchAndEnableSearch = (val: string) => {
    setSearchText(val);
    setSearching(true);
  };

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

  const getSelectedSongs = () => {
    if (checking) {
      const result = selected
        .map((val, index) => {
          if (val) {
            return index;
          }
        })
        .filter(val => val !== undefined);
      if (result.length > 0) {
        return result.map(index => playlist.songList[index!]);
      }
    }
  };

  useEffect(() => setChecking(false), [playlist]);

  return {
    playlist,

    rows,
    setRows,
    selected,
    setSelected,
    checking,
    setChecking,
    searching,
    setSearching,
    searchText,
    setSearchText,
    shouldReRender,
    setShouldReRender,

    handleSearch,
    rssUpdate,
    searchBarRef,
    performSearch,
    refreshing,
    setRefreshing,
    getSongIndex,
    playSong,

    resetSelected,
    toggleSelected,
    toggleSelectedAll,
    searchAndEnableSearch,
    onBackPress,
    getSelectedSongs,
  };
};

export default usePlaylist;
