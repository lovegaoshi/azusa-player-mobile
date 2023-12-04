import React, { useState, useRef } from 'react';

import { reParseSearch } from '../utils/re';
import { updateSubscribeFavList } from '../utils/BiliSubscribe';
import { useNoxSetting } from '../stores/useApp';

export interface UseFav {
  rows: NoxMedia.Song[];
  performSearch: (searchedVal: string) => void;
  setRows: (v: NoxMedia.Song[]) => void;
  handleSearch: (searchedVal: string) => void;
  rssUpdate: (subscribeUrls?: string[]) => Promise<NoxMedia.Playlist>;
  saveCurrentList: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchBarRef: React.MutableRefObject<any>;
  refreshing: boolean;
  setRefreshing: (v: boolean) => void;
}

/**
 * use hook for the paginated fav view. has rows.
 * @param playlist
 * @returns
 */
const usePlaylist = (playlist: NoxMedia.Playlist): UseFav => {
  const [rows, setRows] = useState<NoxMedia.Song[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);
  const progressEmitter = useNoxSetting(
    state => state.searchBarProgressEmitter
  );
  const saveCurrentList = () => updatePlaylist(playlist);
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

  return {
    rows,
    setRows,
    handleSearch,
    rssUpdate,
    saveCurrentList,
    searchBarRef,
    performSearch,
    refreshing,
    setRefreshing,
  };
};

export default usePlaylist;
