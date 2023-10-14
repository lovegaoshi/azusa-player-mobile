import { useNoxSetting } from '@hooks/useSetting';
import usePlayback from './usePlayback';

export default () => {
  const addPlaylistStore = useNoxSetting(state => state.addPlaylist);
  const removePlaylistStore = useNoxSetting(state => state.removePlaylist);
  const { buildBrowseTree } = usePlayback();

  const addPlaylist = (playlist: NoxMedia.Playlist) => {
    addPlaylistStore(playlist);
    buildBrowseTree();
  };

  const removePlaylist = (playlistId: string) => {
    removePlaylistStore(playlistId);
    buildBrowseTree();
  };

  return { addPlaylist, removePlaylist };
};
