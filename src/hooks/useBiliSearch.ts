/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';

import { searchBiliURLs } from '@utils/BiliSearch';
import { useNoxSetting } from '../stores/useApp';
import { getDefaultSearch } from '@utils/ChromeStorage';

interface props {
  onSearched: (val: any) => void;
  searchListTitle?: string;
}
export default ({
  onSearched = (songs: Array<NoxMedia.Song>) => console.log(songs),
  searchListTitle = 'Search',
}: props) => {
  const [searchVal, setSearchVal] = useState('');
  const progressEmitter = useNoxSetting(
    state => state.searchBarProgressEmitter
  );
  const searchPlaylist = useNoxSetting(state => state.searchPlaylist);
  const setSearchPlaylist = useNoxSetting(state => state.setSearchPlaylist);
  const setCurrentPlaylist = useNoxSetting(state => state.setCurrentPlaylist);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  const handleSearch = async (val = searchVal) => {
    progressEmitter(100);
    const searchedResult = (
      await searchBiliURLs({
        input: val,
        progressEmitter,
        favList: [],
        useBiliTag: false,
        fastSearch: playerSetting.fastBiliSearch,
        cookiedSearch: playerSetting.noCookieBiliSearch,
        defaultSearch: await getDefaultSearch(),
      })
    ).songList;
    onSearched(searchedResult);
    const newSearchPlaylist = {
      ...searchPlaylist,
      title: searchListTitle,
      songList: searchedResult,
      subscribeUrl: val.includes('http') ? [val] : [],
    };
    setSearchPlaylist(newSearchPlaylist);
    setCurrentPlaylist(newSearchPlaylist);
    return newSearchPlaylist;
  };

  return { searchVal, setSearchVal, handleSearch };
};
