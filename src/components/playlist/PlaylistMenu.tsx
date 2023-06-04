import * as React from 'react';
import { Menu } from 'react-native-paper';
import Snackbar from 'react-native-snackbar';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '../../hooks/useSetting';
import playlistAnalytics from '../../utils/Analytics';
import PlaylistSettingsButton from '../buttons/PlaylistSettingsButton';
import { PLAYLIST_ENUMS } from '../../enums/Playlist';
import { CopiedPlaylistMenuItem } from '../buttons/CopiedPlaylistButton';
import { biliShazamOnSonglist } from '../../utils/mediafetch/bilishazam';
import { getPlaylistUniqBVIDs } from '../../objects/Playlist';
import { fetchVideoInfo } from '../../utils/mediafetch/bilivideo';
import useAlert from '../dialogs/useAlert';
import { songFetch, fetchiliBVIDs } from '../../utils/mediafetch/bilivideo';

enum ICONS {
  SETTINGS = 'cog',
  BILISHAZAM = 'magnify-plus',
  REMOVE_BILISHAZAM = 'magnify-close',
  ANALYTICS = 'google-analytics',
  REMOVE_BROKEN = 'link-variant-remove',
  RELOAD_BVIDS = 'reload',
  CLEAR = 'notification-clear-all',
  REMOVE = 'trash-can',
}

interface props {
  visible?: boolean;
  toggleVisible?: () => void;
  menuCoords?: NoxTheme.coordinates;
}

export default ({
  visible = false,
  toggleVisible = () => undefined,
  menuCoords = { x: 0, y: 0 },
}: props) => {
  const { t } = useTranslation();
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);
  const removePlaylist = useNoxSetting(state => state.removePlaylist);
  const progressEmitter = useNoxSetting(
    state => state.searchBarProgressEmitter
  );
  const limitedPlaylistFeatures =
    currentPlaylist.type !== PLAYLIST_ENUMS.TYPE_TYPICA_PLAYLIST;
  const { OneWayAlert, TwoWayAlert } = useAlert();

  // TODO: useCallback?
  const playlistAnalysis = (playlist = currentPlaylist) => {
    const analytics = playlistAnalytics(playlist);
    OneWayAlert(
      `歌单 ${playlist.title} 的统计信息`,
      [
        `歌单内总共有${analytics.songsUnique.size}首独特的歌`,
        `歌单内最常出现的歌：${analytics.songTop10
          .slice(0, 5)
          .map(val => `${val[0]} (${String(val[1])})`)
          .join(', ')}`,
        `最近的新歌：${Array.from(analytics.songsUnique)
          .slice(0, 5)
          .reverse()
          .join(', ')}`,
        `bv号总共有${String(analytics.bvid.size)}个，平均每bv号有${(
          analytics.totalCount / analytics.bvid.size
        ).toFixed(1)}首歌`,
        `shazam失败的歌数: ${String(analytics.invalidShazamCount)}/${String(
          analytics.totalCount
        )} (${(
          (analytics.invalidShazamCount * 100) /
          analytics.totalCount
        ).toFixed(1)}%)`,
      ].join('\n'),
      toggleVisible
    );
  };

  const confirmOnPlaylistClear = (playlist = currentPlaylist) => {
    TwoWayAlert(
      t('PlaylistOperations.clearListTitle', { playlist }),
      t('PlaylistOperations.clearListMsg', { playlist }),
      () => {
        updatePlaylist(
          {
            ...playlist,
            songList: [],
          },
          [],
          []
        );
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
        const newSongList = await songFetch({
          videoinfos: await fetchiliBVIDs(
            getPlaylistUniqBVIDs(playlist),
            progressEmitter
          ), // await fetchiliBVID([reExtracted[1]!])
          useBiliTag: playlist.useBiliShazam || false,
        });
        updatePlaylist(
          {
            ...playlist,
            songList: newSongList!,
          },
          [],
          []
        );
        Snackbar.dismiss();
        Snackbar.show({ text: t('PlaylistOperations.reloaded', { playlist }) });
        toggleVisible();
      }
    );
  };

  const playlistCleanup = async (playlist = currentPlaylist) => {
    const promises: Promise<any>[] = [];
    const validBVIds: Array<string> = [];
    Snackbar.show({
      text: t('PlaylistOperations.cleaning', { playlist }),
      duration: Snackbar.LENGTH_INDEFINITE,
    });
    progressEmitter(100);
    getPlaylistUniqBVIDs(playlist).forEach(bvid =>
      promises.push(
        fetchVideoInfo(bvid).then(val => {
          if (val) validBVIds.push(val.bvid);
        })
      )
    );
    await Promise.all(promises);
    updatePlaylist(
      {
        ...playlist,
        songList: playlist.songList.filter(song =>
          validBVIds.includes(song.bvid)
        ),
      },
      [],
      []
    );
    progressEmitter(0);
    Snackbar.dismiss();
    Snackbar.show({ text: t('PlaylistOperations.cleaned', { playlist }) });
  };

  const playlistBiliShazam = async (playlist = currentPlaylist) => {
    progressEmitter(100);
    Snackbar.show({
      text: t('PlaylistOperations.bilishazaming', { playlist }),
      duration: Snackbar.LENGTH_INDEFINITE,
    });
    const newSongList = await biliShazamOnSonglist(playlist.songList, false, progressEmitter);
    updatePlaylist(
      {
        ...playlist,
        songList: newSongList,
      },
      [],
      []
    );
    Snackbar.dismiss();
    Snackbar.show({ text: t('PlaylistOperations.bilishazamed', { playlist }) });
    progressEmitter(0);
  };

  return (
    <Menu visible={visible} onDismiss={toggleVisible} anchor={menuCoords}>
      <PlaylistSettingsButton disabled={limitedPlaylistFeatures} />
      <CopiedPlaylistMenuItem
        getFromListOnClick={() => currentPlaylist}
        onSubmit={() => toggleVisible()}
      />
      <Menu.Item
        leadingIcon={ICONS.BILISHAZAM}
        onPress={() => playlistBiliShazam()}
        title={t('PlaylistOperations.bilishazamTitle')}
      />
      <Menu.Item
        leadingIcon={ICONS.ANALYTICS}
        onPress={() => playlistAnalysis()}
        title={t('PlaylistOperations.analyticsTitle')}
      />
      <Menu.Item
        leadingIcon={ICONS.REMOVE_BROKEN}
        onPress={() => playlistCleanup()}
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
