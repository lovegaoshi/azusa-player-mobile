import * as React from 'react';
import { Menu } from 'react-native-paper';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import TrackPlayer from 'react-native-track-player';

import { useNoxSetting } from '@stores/useApp';
import useUpdatePlaylist from '@hooks/useUpdatePlaylist';
import { CopiedPlaylistMenuItem } from '@components/buttons/CopiedPlaylistButton';
import RenameSongButton from './RenameSong/RenameSongButton';
import useSongOperations from '@hooks/useSongOperations';
import { addR128Gain, getR128Gain } from '@utils/ffmpeg/r128Store';
import ABSliderMenu from './ABSliderMenu';
import usePlayback from '@hooks/usePlayback';

enum ICONS {
  SEND_TO = 'playlist-plus',
  COPY_SONG_NAME = '',
  SEARCH_IN_PLAYLIST = 'text-search',
  RELOAD = 'refresh',
  REMOVE = 'delete',
  REMOVE_AND_BAN_BVID = 'delete-forever',
  DETAIL = 'information-outline',
  RADIO = 'radio-tower',
  R128GAIN = 'replay',
  ABREPEAT = 'ab-testing',
}

interface Props {
  song: NoxMedia.Song;
  songMenuVisible: boolean;
  setSongMenuVisible: (val: boolean) => void;
  songMenuSongIndexes: [number];
  menuCoords?: NoxTheme.coordinates;
  handleSearch?: (val: string) => void;
}

// TODO: refactro this into tracklist's songmenu
export default ({
  song,
  songMenuVisible,
  setSongMenuVisible,
  songMenuSongIndexes,
  menuCoords = { x: 0, y: 0 },
}: Props) => {
  const { t } = useTranslation();
  const currentPlaylist = useNoxSetting(state => state.currentPlayingList);
  const playlists = useNoxSetting(state => state.playlists);
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);
  const updateTrack = useNoxSetting(state => state.updateTrack);

  const { updateSongIndex, updateSongMetadata } = useUpdatePlaylist();
  const { startRadio, radioAvailable } = useSongOperations();
  const { playFromPlaylist } = usePlayback();

  const closeMenu = React.useCallback(() => setSongMenuVisible(false), []);

  const selectedPlaylist = () => {
    const songs = [song];
    return {
      ...currentPlaylist,
      songList: songs,
      title:
        songs.length > 1
          ? t('SongOperations.selectedSongs')
          : songs[0].parsedName,
    };
  };

  const renameSong = async (name: string) => {
    updateSongIndex(songMenuSongIndexes[0], {
      name,
      parsedName: name,
    });
    const index = await TrackPlayer.getActiveTrackIndex();
    index !== undefined &&
      (await TrackPlayer.updateMetadataForTrack(index, {
        title: name,
      }));
    updateTrack();
  };

  const reloadSong = async () => {
    const currentPlaylist2 = playlists[currentPlaylist.id];
    const metadata = await updateSongMetadata(
      songMenuSongIndexes[0],
      currentPlaylist2
    );
    const index = await TrackPlayer.getActiveTrackIndex();
    index !== undefined &&
      (await TrackPlayer.updateMetadataForTrack(index, {
        title: metadata.name,
        artwork: metadata.cover,
      }));
    updateTrack();
    return metadata;
  };

  const removeSongs = async (banBVID = false) => {
    const currentPlaylist2 = playlists[currentPlaylist.id];
    const songs = [song];
    const newPlaylist = banBVID
      ? {
          ...currentPlaylist2,
          blacklistedUrl: currentPlaylist2.blacklistedUrl.concat(
            songs.map(song => song.bvid)
          ),
        }
      : currentPlaylist2;
    updatePlaylist(newPlaylist, [], songs);
    playFromPlaylist({ playlist: newPlaylist });
    setSongMenuVisible(false);
  };

  const setR128Gain = (gain: number | null) => {
    addR128Gain(song, gain);
    closeMenu();
  };

  return (
    <Menu visible={songMenuVisible} onDismiss={closeMenu} anchor={menuCoords}>
      <CopiedPlaylistMenuItem
        getFromListOnClick={selectedPlaylist}
        onSubmit={closeMenu}
      />
      <RenameSongButton
        getSongOnClick={() => song}
        onSubmit={(rename: string) => {
          closeMenu();
          renameSong(rename);
        }}
      />
      <Menu.Item
        leadingIcon={ICONS.RELOAD}
        onPress={() => {
          closeMenu();
          reloadSong();
        }}
        title={t('SongOperations.reloadSong')}
      />
      <Menu.Item
        leadingIcon={ICONS.RADIO}
        disabled={!radioAvailable(song)}
        onPress={() => {
          startRadio(song);
          closeMenu();
        }}
        title={t('SongOperations.songStartRadio')}
      />
      <Menu.Item
        leadingIcon={ICONS.R128GAIN}
        onPress={async () =>
          Alert.alert(
            `R128Gain of ${song.parsedName}`,
            `${getR128Gain(song)} dB`,
            [
              { text: 'Nullify', onPress: () => setR128Gain(null) },
              { text: 'Zero', onPress: () => setR128Gain(0) },
              { text: 'OK', onPress: closeMenu },
            ],
            { cancelable: true }
          )
        }
        title={t('SongOperations.songR128gain')}
      />
      <ABSliderMenu song={song} closeMenu={closeMenu} />
      <Menu.Item
        leadingIcon={ICONS.REMOVE_AND_BAN_BVID}
        onPress={() => removeSongs(true)}
        title={t('SongOperations.songRemoveTitle')}
      />
    </Menu>
  );
};
