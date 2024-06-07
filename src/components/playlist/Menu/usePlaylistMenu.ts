import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';
import usePlaylistCRUD from '@hooks/usePlaylistCRUD';
import useAlert from '@components/dialogs/useAlert';
import usePlaylistBrowseTree from '@hooks/usePlaylistBrowseTree';
import useSnack from '@stores/useSnack';

interface Props {
  callback?: () => void;
}
export default ({ callback = () => {} }: Props) => {
  const { t } = useTranslation();
  const setSnack = useSnack(state => state.setSnack);
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const playlistCRUD = usePlaylistCRUD();
  const { removePlaylist } = usePlaylistBrowseTree();
  const { OneWayAlert, TwoWayAlert } = useAlert();

  const playlistSync2Bilibili = (playlist = currentPlaylist) =>
    setSnack({
      snackMsg: {
        processing: t('PlaylistOperations.bilisyncing', { playlist }),
        success: t('PlaylistOperations.bilisynced', { playlist }),
      },
      processFunction: () => playlistCRUD.playlistSync2Bilibili(playlist),
    });

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
      () =>
        setSnack({
          snackMsg: {
            processing: t('PlaylistOperations.reloading', { playlist }),
            success: t('PlaylistOperations.reloaded', { playlist }),
          },
          processFunction: () => playlistCRUD.playlistReload(playlist),
          callback,
        })
    );
  };

  const playlistCleanup = (playlist = currentPlaylist) =>
    setSnack({
      snackMsg: {
        processing: t('PlaylistOperations.cleaning', { playlist }),
        success: t('PlaylistOperations.cleaned', { playlist }),
      },
      processFunction: () => playlistCRUD.playlistCleanup(playlist),
    });

  const playlistBiliShazam = (playlist = currentPlaylist) =>
    setSnack({
      snackMsg: {
        processing: t('PlaylistOperations.bilishazaming', { playlist }),
        success: t('PlaylistOperations.bilishazamed', { playlist }),
      },
      processFunction: () => playlistCRUD.playlistBiliShazam(playlist),
    });

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
