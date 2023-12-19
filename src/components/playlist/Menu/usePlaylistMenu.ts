import Snackbar from 'react-native-snackbar';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';
import usePlaylistCRUD from '@hooks/usePlaylistCRUD';
import useAlert from '@components/dialogs/useAlert';
import usePlaylistAA from '@hooks/usePlaylistAA';

interface Props {
  callback?: () => void;
}
export default ({ callback = () => {} }: Props) => {
  const { t } = useTranslation();
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const playlistCRUD = usePlaylistCRUD();
  const { removePlaylist } = usePlaylistAA();
  const { OneWayAlert, TwoWayAlert } = useAlert();

  const playlistSync2Bilibili = async (playlist = currentPlaylist) => {
    Snackbar.show({
      text: t('PlaylistOperations.bilisyncing', { playlist }),
      duration: Snackbar.LENGTH_INDEFINITE,
    });
    await playlistCRUD.playlistSync2Bilibili(playlist);
    Snackbar.dismiss();
    Snackbar.show({ text: t('PlaylistOperations.bilisynced', { playlist }) });
  };

  const playlistAnalyze = (playlist = currentPlaylist) => {
    const analytics = playlistCRUD.playlistAnalyze(playlist, 5);
    OneWayAlert(analytics.title, analytics.content.join('\n'), callback);
  };

  const confirmOnPlaylistClear = (playlist = currentPlaylist) => {
    TwoWayAlert(
      t('PlaylistOperations.clearListTitle', { playlist }),
      t('PlaylistOperations.clearListMsg', { playlist }),
      () => {
        playlistCRUD.playlistClear(playlist);
        callback();
      }
    );
  };

  const confirmOnPlaylistDelete = (playlist = currentPlaylist) => {
    TwoWayAlert(
      t('PlaylistOperations.deleteListTitle', { playlist }),
      t('PlaylistOperations.deleteListMsg', { playlist }),
      () => {
        removePlaylist(playlist.id);
        callback();
      }
    );
  };

  const confirmOnPlaylistReload = (playlist = currentPlaylist) => {
    TwoWayAlert(
      t('PlaylistOperations.resetListTitle', { playlist }),
      t('PlaylistOperations.resetListMsg', { playlist }),
      async () => {
        Snackbar.show({
          text: t('PlaylistOperations.reloading', { playlist }),
          duration: Snackbar.LENGTH_INDEFINITE,
        });
        await playlistCRUD.playlistReload(playlist);
        Snackbar.dismiss();
        Snackbar.show({ text: t('PlaylistOperations.reloaded', { playlist }) });
        callback();
      }
    );
  };

  const playlistCleanup = async (playlist = currentPlaylist) => {
    Snackbar.show({
      text: t('PlaylistOperations.cleaning', { playlist }),
      duration: Snackbar.LENGTH_INDEFINITE,
    });
    await playlistCRUD.playlistCleanup(playlist);
    Snackbar.dismiss();
    Snackbar.show({ text: t('PlaylistOperations.cleaned', { playlist }) });
  };

  const playlistBiliShazam = async (playlist = currentPlaylist) => {
    Snackbar.show({
      text: t('PlaylistOperations.bilishazaming', { playlist }),
      duration: Snackbar.LENGTH_INDEFINITE,
    });
    await playlistCRUD.playlistBiliShazam(playlist);
    Snackbar.dismiss();
    Snackbar.show({ text: t('PlaylistOperations.bilishazamed', { playlist }) });
  };
  return {
    ...playlistCRUD,
    playlistSync2Bilibili,
    playlistAnalyze,
    confirmOnPlaylistClear,
    confirmOnPlaylistDelete,
    confirmOnPlaylistReload,
    playlistCleanup,
    playlistBiliShazam,
  };
};
