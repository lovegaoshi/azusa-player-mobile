import { useNoxSetting } from '@stores/useApp';
import { useAndroidAuto } from './usePlaybackAA';

/**
 * wrapper of playlist operations with browsetree updates.
 */
export default function usePlaylistBrowseTree() {
  const addPlaylistStore = useNoxSetting(state => state.addPlaylist);
  const removePlaylistStore = useNoxSetting(state => state.removePlaylist);
  const { buildBrowseTree } = useAndroidAuto();

  const addPlaylist = (playlist: NoxMedia.Playlist) => {
    addPlaylistStore(playlist);
    buildBrowseTree();
  };

  const removePlaylist = (playlistId: string) => {
    removePlaylistStore(playlistId);
    buildBrowseTree();
  };

  return { addPlaylist, removePlaylist };
}
