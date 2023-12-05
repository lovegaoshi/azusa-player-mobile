import React, { useState, useRef } from 'react';

import { reParseSearch } from '../utils/re';
import { updateSubscribeFavList } from '../utils/BiliSubscribe';
import { useNoxSetting } from '../stores/useApp';

export interface UsePlaylist {
  playlist: NoxMedia.Playlist;
  rows: NoxMedia.Song[];
  setRows: (v: NoxMedia.Song[]) => void;
  performSearch: (searchedVal: string) => void;
  handleSearch: (searchedVal: string) => void;
  rssUpdate: (subscribeUrls?: string[]) => Promise<NoxMedia.Playlist>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchBarRef: React.MutableRefObject<any>;
  refreshing: boolean;
  setRefreshing: (v: boolean) => void;
  getSongIndex: (item: NoxMedia.Song, index: number) => number;
  playSong: (
    song: NoxMedia.Song,
    callback: (p: NoxMedia.Playlist, s: NoxMedia.Song) => void
  ) => void;
}

/**
 * use hook for the paginated fav view. has rows.
 * @param playlist
 * @returns
 */
const usePlaylist = (playlist: NoxMedia.Playlist): UsePlaylist => {
  const [rows, setRows] = useState<NoxMedia.Song[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const setCurrentPlayingId = useNoxSetting(state => state.setCurrentPlayingId);
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);
  const progressEmitter = useNoxSetting(
    state => state.searchBarProgressEmitter
  );
  const searchBarRef = useRef();

  const handleSearch = (searchedVal: string) => {
    if (searchedVal === '') {
      setRows(playlist.songList);
      return;
    }
    setRows(reParseSearch({ searchStr: searchedVal, rows: playlist.songList }));
  };

  const rssUpdate = (subscribeUrls?: string[]) =>
    updateSubscribeFavList({
      playlist,
      subscribeUrls,
      progressEmitter,
      updatePlaylist,
    });

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

  return {
    playlist,
    rows,
    setRows,
    handleSearch,
    rssUpdate,
    searchBarRef,
    performSearch,
    refreshing,
    setRefreshing,
    getSongIndex,
    playSong,
  };
};

export default usePlaylist;
