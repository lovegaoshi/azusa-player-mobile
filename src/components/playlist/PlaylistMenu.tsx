import * as React from 'react';
import { Menu } from 'react-native-paper';
import { Alert } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { useNoxSetting } from '../../hooks/useSetting';
import coordinates from '../../objects/Coordinate';
import playlistAnalytics from '../../utils/Analytics';
import PlaylistSettingsButton from '../buttons/PlaylistSettingsButton';
import { PLAYLIST_ENUMS } from '../../enums/Playlist';
import { CopiedPlaylistMenuItem } from '../buttons/CopiedPlaylistButton';
import { twoWayAlert, oneWayAlert } from '../../utils/Utils';
import { getBVIDList, biliShazamOnSonglist } from '../../utils/DataProcess';
import { getPlaylistUniqBVIDs } from '../../objects/Playlist';
import { fetchVideoInfo } from '../../utils/Data';

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
  menuCoords?: coordinates;
}

export default ({
  visible = false,
  toggleVisible = () => void 0,
  menuCoords = { x: 0, y: 0 },
}: props) => {
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);
  const removePlaylist = useNoxSetting(state => state.removePlaylist);
  const progressEmitter = useNoxSetting(
    state => state.searchBarProgressEmitter
  );
  const limitedPlaylistFeatures =
    currentPlaylist.type !== PLAYLIST_ENUMS.TYPE_TYPICA_PLAYLIST;

  // TODO: useCallback?
  const playlistAnalysis = (playlist = currentPlaylist) => {
    const analytics = playlistAnalytics(playlist);
    oneWayAlert(
      `歌单 ${playlist.title} 的统计信息`,
      [
        `歌单内总共有${analytics.songsUnique.size}首独特的歌`,
        `歌单内最常出现的歌：${analytics.songTop10
          .slice(-5)
          .map(val => `${val[0]} (${String(val[1])})`)
          .join(', ')}`,
        `最近的新歌：${Array.from(analytics.songsUnique)
          .slice(-5)
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
    twoWayAlert(
      `Claer ${playlist.title}?`,
      `Are you sure to clear playlist ${playlist.title}?`,
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
    twoWayAlert(
      `Delete ${playlist.title}?`,
      `Are you sure to delete playlist ${playlist.title}?`,
      () => {
        removePlaylist(playlist.id);
        toggleVisible();
      }
    );
  };

  const confirmOnPlaylistReload = (playlist = currentPlaylist) => {
    twoWayAlert(
      `Reload ${playlist.title}?`,
      `Are you sure to reload all BVIDs in playlist ${playlist.title}?`,
      async () => {
        Snackbar.show({
          text: '正在重载歌单……',
          duration: Snackbar.LENGTH_INDEFINITE,
        });
        const newSongList = await getBVIDList({
          bvids: getPlaylistUniqBVIDs(playlist),
          progressEmitter,
          useBiliTag: playlist.useBiliShazam,
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
        Snackbar.show({ text: '重载歌单完成' });
        toggleVisible();
      }
    );
  };

  const playlistCleanup = async (playlist = currentPlaylist) => {
    const promises: Promise<any>[] = [];
    const validBVIds: Array<string> = [];
    Snackbar.show({
      text: '正在清理歌单无效的BV号……',
      duration: Snackbar.LENGTH_INDEFINITE,
    });
    progressEmitter(100);
    getPlaylistUniqBVIDs(playlist).forEach(bvid =>
      promises.push(
        fetchVideoInfo(bvid).then(val => validBVIds.push(val?.bvid))
      )
    );
    await Promise.all(promises);
    progressEmitter(0);
    Snackbar.dismiss();
    Snackbar.show({ text: '歌单清理完成' });
    console.log(validBVIds);
  };

  const playlistBiliShazam = async (playlist = currentPlaylist) => {
    progressEmitter(100);
    Snackbar.show({
      text: `正在用b站识歌 on ${playlist.title}……`,
      duration: Snackbar.LENGTH_INDEFINITE,
    });
    const newSongList = await biliShazamOnSonglist(playlist.songList, false);
    updatePlaylist(
      {
        ...playlist,
        songList: newSongList,
      },
      [],
      []
    );
    Snackbar.dismiss();
    Snackbar.show({ text: '歌单识歌完成' });
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
        title="BiliShazam"
      />
      <Menu.Item
        leadingIcon={ICONS.ANALYTICS}
        onPress={() => playlistAnalysis()}
        title="Analytics"
      />
      <Menu.Item
        leadingIcon={ICONS.REMOVE_BROKEN}
        onPress={() => playlistCleanup()}
        title="Remove Broken"
        disabled={limitedPlaylistFeatures}
      />
      <Menu.Item
        leadingIcon={ICONS.RELOAD_BVIDS}
        onPress={() => confirmOnPlaylistReload()}
        title="Reload Bvids"
        disabled={limitedPlaylistFeatures}
      />
      <Menu.Item
        leadingIcon={ICONS.CLEAR}
        onPress={() => confirmOnPlaylistClear()}
        title="Clear"
        disabled={limitedPlaylistFeatures}
      />
      <Menu.Item
        leadingIcon={ICONS.REMOVE}
        onPress={() => confirmOnPlaylistDelete()}
        title="Remove"
        disabled={limitedPlaylistFeatures}
      />
    </Menu>
  );
};
