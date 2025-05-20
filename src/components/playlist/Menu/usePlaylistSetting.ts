import usePlaylistSetting from '@hooks/usePlaylistSetting';
import { cycleThroughPlaymode } from '@utils/RNTPUtils';
import playlistStore, { initializePlaybackMode } from '@stores/playingList';

export default (playlist: NoxMedia.Playlist) => {
  const usedPlaylistSetting = usePlaylistSetting(playlist);

  const saveSetting = (
    setting: Partial<NoxMedia.Playlist> = {},
    callback: (val: NoxMedia.Playlist) => void = () => undefined,
  ) => {
    usedPlaylistSetting.saveSetting(setting, callback);
    cycleThroughPlaymode(
      initializePlaybackMode(
        usedPlaylistSetting.repeatMode ??
          playlistStore.getState().playmodeGlobal,
        false,
      ),
    );
  };

  return {
    ...usedPlaylistSetting,
    saveSetting,
  };
};
