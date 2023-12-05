import * as React from 'react';
import { Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import usePlaylist from '@hooks/usePlaylistRN';
import PlaylistSettingsButton from './PlaylistSettingsButton';
import { PLAYLIST_ENUMS } from '@enums/Playlist';
import { CopiedPlaylistMenuItem } from '@components/buttons/CopiedPlaylistButton';

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
  playlist: NoxMedia.Playlist;
}

export default ({
  visible = false,
  toggleVisible = () => undefined,
  menuCoords = { x: 0, y: 0 },
  playlist,
}: Props) => {
  const { t } = useTranslation();
  const {
    playlistSync2BilibiliRN,
    playlistAnalysis,
    confirmOnPlaylistClear,
    confirmOnPlaylistDelete,
    confirmOnPlaylistReload,
    playlistCleanupRN,
    playlistBiliShazamRN,
  } = usePlaylist({ callback: toggleVisible });
  const limitedPlaylistFeatures =
    playlist.type !== PLAYLIST_ENUMS.TYPE_TYPICA_PLAYLIST;

  return (
    <Menu visible={visible} onDismiss={toggleVisible} anchor={menuCoords}>
      <PlaylistSettingsButton
        disabled={limitedPlaylistFeatures}
        playlist={playlist}
      />
      <CopiedPlaylistMenuItem
        getFromListOnClick={() => playlist}
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
