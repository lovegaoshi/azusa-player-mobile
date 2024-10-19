import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';
import useDataSaver from './useDataSaver';
import useSnack from '@stores/useSnack';
import {
  _playFromPlaylist,
  _playFromMediaId,
  _playAsSearchList,
  _shuffleAll,
  _playFromSearch,
} from './usePlayback.migrate';
import type { PlayFromPlaylist, PlayAsSearchList } from './usePlayback.migrate';

const usePlayback = () => {
  const { t } = useTranslation();
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const playlists = useNoxSetting(state => state.playlists);
  const playlistIds = useNoxSetting(state => state.playlistIds);
  const getPlaylist = useNoxSetting(state => state.getPlaylist);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const searchPlaylist = useNoxSetting(state => state.searchPlaylist);
  const setCurrentPlaylist = useNoxSetting(state => state.setCurrentPlaylist);
  const setSearchPlaylist = useNoxSetting(state => state.setSearchPlaylist);
  const setCurrentPlayingId = useNoxSetting(state => state.setCurrentPlayingId);
  const setCurrentPlayingList = useNoxSetting(
    state => state.setCurrentPlayingList,
  );
  const { isDataSaving } = useDataSaver();
  const setSnack = useSnack(state => state.setSnack);

  const playFromPlaylist = async (args: PlayFromPlaylist) =>
    _playFromPlaylist({
      ...args,
      setCurrentPlayingId,
      currentPlayingId,
      setCurrentPlayingList,
    });

  const playAsSearchList = async ({
    songs,
    playlistSongs,
    title = t('PlaylistsDrawer.SearchListTitle'),
    song,
  }: PlayAsSearchList) =>
    _playAsSearchList({
      songs,
      playlistSongs,
      title,
      song,
      searchPlaylist,
      setSearchPlaylist,
      setCurrentPlaylist,
    });

  const shuffleAll = async () =>
    _shuffleAll({
      playlists,
      getPlaylist,
      isDataSaving,
      t,
    });

  const playFromMediaId = async (mediaId: string) =>
    _playFromMediaId({
      mediaId,
      playlists,
      currentPlayingList,
      getPlaylist,
      isDataSaving,
      playlistIds,
    });

  const playFromSearch = async (query: string) => {
    const result = await _playFromSearch({
      query,
      getPlaylist,
      searchPlaylist,
      setCurrentPlaylist,
      currentPlayingList,
      playlists,
      playlistIds,
      setSearchPlaylist,
      playFromPlaylistF: playFromPlaylist,
      shuffleAllF: shuffleAll,
      playAsSearchListF: playAsSearchList,
    });
    if (result === true) {
      setSnack({ snackMsg: { success: t('AndroidAuto.PlayingShuffle') } });
    }
  };

  return {
    playFromMediaId,
    playFromSearch,
    playFromPlaylist,
    shuffleAll,
    playAsSearchList,
    playlists,
    playlistIds,
  };
};
export default usePlayback;
