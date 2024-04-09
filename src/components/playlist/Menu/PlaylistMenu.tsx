import * as React from 'react';
import { Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import usePlaylist from './usePlaylistMenu';
import PlaylistSettingsButton from './PlaylistSettingsButton';
import { PlaylistTypes } from '@enums/Playlist';
import { CopiedPlaylistMenuItem } from '@components/buttons/CopiedPlaylistButton';
import PlaylistSortButton from './PlaylistSortButton';

enum Icons {
  SETTINGS = 'cog',
  BILISHAZAM = 'magnify-plus',
  REMOVE_BILISHAZAM = 'magnify-close',
  ANALYTICS = 'google-analytics',
  REMOVE_BROKEN = 'link-variant-remove',
  RELOAD_BVIDS = 'reload',
  CLEAR = 'notification-clear-all',
  REMOVE = 'trash-can',
  BILISYNC = 'sync',
  SORT = 'sort',
}

interface Props {
  visible?: boolean;
  toggleVisible?: () => void;
  menuCoords?: NoxTheme.coordinates;
  playlist: NoxMedia.Playlist;
  songListUpdateHalt: () => void;
}

export default ({
  visible = false,
  toggleVisible = () => undefined,
  menuCoords = { x: 0, y: 0 },
  playlist,
  songListUpdateHalt,
}: Props) => {
  const { t } = useTranslation();
  const {
    playlistSync2Bilibili,
    playlistAnalyze,
    confirmOnPlaylistClear,
    confirmOnPlaylistDelete,
    confirmOnPlaylistReload,
    playlistCleanup,
    playlistBiliShazam,
    sortPlaylist,
  } = usePlaylist({ callback: toggleVisible });
  const limitedPlaylistFeatures =
    playlist.type !== PlaylistTypes.TYPE_TYPICA_PLAYLIST;

  return (
    <Menu visible={visible} onDismiss={toggleVisible} anchor={menuCoords}>
      <PlaylistSettingsButton
        disabled={limitedPlaylistFeatures}
        playlist={playlist}
      />
      <CopiedPlaylistMenuItem
        getFromListOnClick={() => playlist}
        onSubmit={toggleVisible}
      />
      <PlaylistSortButton
        sortPlaylist={(o, a, p) => {
          songListUpdateHalt();
          sortPlaylist(o, a, p);
        }}
        playlist={playlist}
        onCancel={toggleVisible}
      />
      <Menu.Item
        leadingIcon={Icons.BILISYNC}
        onPress={() => playlistSync2Bilibili()}
        title={t('PlaylistOperations.bilisyncTitle')}
      />
      <Menu.Item
        leadingIcon={Icons.BILISHAZAM}
        onPress={() => playlistBiliShazam()}
        title={t('PlaylistOperations.bilishazamTitle')}
      />
      <Menu.Item
        leadingIcon={Icons.ANALYTICS}
        onPress={() => playlistAnalyze()}
        title={t('PlaylistOperations.analyticsTitle')}
      />
      <Menu.Item
        leadingIcon={Icons.REMOVE_BROKEN}
        onPress={() => playlistCleanup()}
        title={t('PlaylistOperations.removeBrokenTitle')}
        disabled={limitedPlaylistFeatures}
      />
      <Menu.Item
        leadingIcon={Icons.RELOAD_BVIDS}
        onPress={() => confirmOnPlaylistReload()}
        title={t('PlaylistOperations.reloadBVIDTitle')}
        disabled={limitedPlaylistFeatures}
      />
      <Menu.Item
        leadingIcon={Icons.CLEAR}
        onPress={() => confirmOnPlaylistClear()}
        title={t('PlaylistOperations.clearPlaylistTitle')}
        disabled={limitedPlaylistFeatures}
      />
      <Menu.Item
        leadingIcon={Icons.REMOVE}
        onPress={() => confirmOnPlaylistDelete()}
        title={t('PlaylistOperations.removePlaylistTitle')}
        disabled={limitedPlaylistFeatures}
      />
    </Menu>
  );
};
