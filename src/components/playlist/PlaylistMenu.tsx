import * as React from 'react';
import { Menu } from 'react-native-paper';
import Snackbar from 'react-native-snackbar';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';
import usePlaylist from '@hooks/usePlaylist';
import PlaylistSettingsButton from './PlaylistSettingsButton';
import { PLAYLIST_ENUMS } from '@enums/Playlist';
import { CopiedPlaylistMenuItem } from '../buttons/CopiedPlaylistButton';
import useAlert from '../dialogs/useAlert';
import usePlaylistOperation from '@hooks/usePlaylistOperation';

enum ICONS {
  SETTINGS = 'cog',
  BILISHAZAM = 'magnify-plus',
  REMOVE_BILISHAZAM = 'magnify-close',
  ANALYTICS = 'google-analytics',
  REMOVE_BROKEN = 'link-variant-remove',
  RELOAD_BVIDS = 'reload',
  CLEAR = 'notification-clear-all',
  REMOVE = 'trash-can',
  BILISYNC = 'sync',
}

interface Props {
  visible?: boolean;
  toggleVisible?: () => void;
  menuCoords?: NoxTheme.coordinates;
}

export default ({
  visible = false,
  toggleVisible = () => undefined,
  menuCoords = { x: 0, y: 0 },
}: Props) => {
  const { t } = useTranslation();
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const {
    playlistAnalyze,
    playlistCleanup,
    playlistBiliShazam,
    playlistReload,
    playlistClear,
    playlistSync2Bilibili,
  } = usePlaylist();
  const { removePlaylist } = usePlaylistOperation();
  const limitedPlaylistFeatures =
    currentPlaylist.type !== PLAYLIST_ENUMS.TYPE_TYPICA_PLAYLIST;
  const { OneWayAlert, TwoWayAlert } = useAlert();

  const playlistSync2BilibiliRN = async (playlist = currentPlaylist) => {
    Snackbar.show({
      text: t('PlaylistOperations.bilisyncing', { playlist }),
      duration: Snackbar.LENGTH_INDEFINITE,
    });
    await playlistSync2Bilibili(playlist);
    Snackbar.dismiss();
    Snackbar.show({ text: t('PlaylistOperations.bilisynced', { playlist }) });
  };

  const playlistAnalysis = (playlist = currentPlaylist) => {
    const analytics = playlistAnalyze(playlist, 5);
    OneWayAlert(analytics.title, analytics.content.join('\n'), toggleVisible);
  };

  const confirmOnPlaylistClear = (playlist = currentPlaylist) => {
    TwoWayAlert(
      t('PlaylistOperations.clearListTitle', { playlist }),
      t('PlaylistOperations.clearListMsg', { playlist }),
      () => {
        playlistClear(playlist);
        toggleVisible();
      }
    );
  };

  const confirmOnPlaylistDelete = (playlist = currentPlaylist) => {
    TwoWayAlert(
      t('PlaylistOperations.deleteListTitle', { playlist }),
      t('PlaylistOperations.deleteListMsg', { playlist }),
      () => {
        removePlaylist(playlist.id);
        toggleVisible();
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
        await playlistReload(playlist);
        Snackbar.dismiss();
        Snackbar.show({ text: t('PlaylistOperations.reloaded', { playlist }) });
        toggleVisible();
      }
    );
  };

  const playlistCleanupRN = async (playlist = currentPlaylist) => {
    Snackbar.show({
      text: t('PlaylistOperations.cleaning', { playlist }),
      duration: Snackbar.LENGTH_INDEFINITE,
    });
    await playlistCleanup(playlist);
    Snackbar.dismiss();
    Snackbar.show({ text: t('PlaylistOperations.cleaned', { playlist }) });
  };

  const playlistBiliShazamRN = async (playlist = currentPlaylist) => {
    Snackbar.show({
      text: t('PlaylistOperations.bilishazaming', { playlist }),
      duration: Snackbar.LENGTH_INDEFINITE,
    });
    await playlistBiliShazam(playlist);
    Snackbar.dismiss();
    Snackbar.show({ text: t('PlaylistOperations.bilishazamed', { playlist }) });
  };

  return (
    <Menu visible={visible} onDismiss={toggleVisible} anchor={menuCoords}>
      <PlaylistSettingsButton disabled={limitedPlaylistFeatures} />
      <CopiedPlaylistMenuItem
        getFromListOnClick={() => currentPlaylist}
        onSubmit={() => toggleVisible()}
      />
      <Menu.Item
        leadingIcon={ICONS.BILISYNC}
        onPress={() => playlistSync2BilibiliRN()}
        title={t('PlaylistOperations.bilisyncTitle')}
      />
      <Menu.Item
        leadingIcon={ICONS.BILISHAZAM}
        onPress={() => playlistBiliShazamRN()}
        title={t('PlaylistOperations.bilishazamTitle')}
      />
      <Menu.Item
        leadingIcon={ICONS.ANALYTICS}
        onPress={() => playlistAnalysis()}
        title={t('PlaylistOperations.analyticsTitle')}
      />
      <Menu.Item
        leadingIcon={ICONS.REMOVE_BROKEN}
        onPress={() => playlistCleanupRN()}
        title={t('PlaylistOperations.removeBrokenTitle')}
        disabled={limitedPlaylistFeatures}
      />
      <Menu.Item
        leadingIcon={ICONS.RELOAD_BVIDS}
        onPress={() => confirmOnPlaylistReload()}
        title={t('PlaylistOperations.reloadBVIDTitle')}
        disabled={limitedPlaylistFeatures}
      />
      <Menu.Item
        leadingIcon={ICONS.CLEAR}
        onPress={() => confirmOnPlaylistClear()}
        title={t('PlaylistOperations.clearPlaylistTitle')}
        disabled={limitedPlaylistFeatures}
      />
      <Menu.Item
        leadingIcon={ICONS.REMOVE}
        onPress={() => confirmOnPlaylistDelete()}
        title={t('PlaylistOperations.removePlaylistTitle')}
        disabled={limitedPlaylistFeatures}
      />
    </Menu>
  );
};
