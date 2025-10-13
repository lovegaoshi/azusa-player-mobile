import { useState } from 'react';
import i18n from 'i18next';

import { searchBiliURLs } from '@utils/BiliSearch';
import { useNoxSetting } from '../stores/useApp';
import { getDefaultSearch } from '@utils/ChromeStorage';

interface Props {
  onSearched?: (val: NoxMedia.SearchPlaylist) => void;
  searchListTitle?: string;
}
export default function useBiliSearch({
  onSearched = console.log,
  searchListTitle = i18n.t('PlaylistOperations.searchListName'),
}: Props) {
  const [searchVal, setSearchVal] = useState('');
  const progressEmitter = useNoxSetting(
    state => state.searchBarProgressEmitter,
  );
  const searchPlaylist = useNoxSetting(state => state.searchPlaylist);
  const setSearchPlaylist = useNoxSetting(state => state.setSearchPlaylist);
  const setCurrentPlaylist = useNoxSetting(state => state.setCurrentPlaylist);
  const playerSetting = useNoxSetting(state => state.playerSetting);

  const handleSearch = async (val = searchVal) => {
    progressEmitter(100);
    const searchedResult = await searchBiliURLs({
      input: val,
      progressEmitter,
      favList: [],
      useBiliTag: false,
      fastSearch: playerSetting.fastBiliSearch,
      cookiedSearch: playerSetting.noCookieBiliSearch,
      defaultSearch: await getDefaultSearch(),
    });
    onSearched(searchedResult);
    const newSearchPlaylist = {
      ...searchPlaylist,
      ...searchedResult,
      title: searchListTitle,
      subscribeUrl:
        // HACK: add these search URLs to playlist's subscribe watch folder
        val.startsWith('http') || val.startsWith('local://') ? [val] : [],
    };
    setSearchPlaylist(newSearchPlaylist);
    setCurrentPlaylist(newSearchPlaylist);
    return newSearchPlaylist;
  };

  return { searchVal, setSearchVal, handleSearch };
}
