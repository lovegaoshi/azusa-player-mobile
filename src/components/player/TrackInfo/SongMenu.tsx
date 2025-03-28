import * as React from 'react';
import { Menu } from 'react-native-paper';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';
import usePlaylistCRUD from '@hooks/usePlaylistCRUD';
import { CopiedPlaylistMenuItem } from '@components/buttons/CopiedPlaylistButton';
import RenameSongButton from './RenameSong/RenameSongButton';
import useSongOperations from '@hooks/useSongOperations';
import { addR128Gain, getR128Gain } from '@utils/ffmpeg/r128Store';
import ABSliderMenu from './ABSliderMenu';
import usePlayback from '@hooks/usePlayback';
import { useTrackStore } from '@hooks/useActiveTrack';
import radioAvailable from '@utils/radiofetch/fetch';

enum Icons {
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
  menuCoords?: NoxTheme.Coordinates;
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
  const getPlaylist = useNoxSetting(state => state.getPlaylist);
  const updateTrack = useTrackStore(state => state.updateTrack);

  const playlistCRUD = usePlaylistCRUD();
  const { updateSongIndex, updateSongMetadata } = playlistCRUD;
  const { startRadio } = useSongOperations();
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

  const renameSong = (name: string) => {
    updateSongIndex(songMenuSongIndexes[0], {
      name,
      parsedName: name,
    });
    updateTrack({ title: name });
  };

  const reloadSong = async () => {
    const currentPlaylist2 = await getPlaylist(currentPlaylist.id);
    const metadata = await updateSongMetadata(
      songMenuSongIndexes[0],
      currentPlaylist2,
    );
    updateTrack({
      title: metadata.name,
      artwork: metadata.cover,
    });
    return metadata;
  };

  const removeSongs = async (banBVID = false) => {
    playFromPlaylist({
      playlist: await playlistCRUD.removeSongs([song], banBVID),
    });
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
        leadingIcon={Icons.RELOAD}
        onPress={() => {
          closeMenu();
          reloadSong();
        }}
        title={t('SongOperations.reloadSong')}
      />
      <Menu.Item
        leadingIcon={Icons.RADIO}
        disabled={!radioAvailable(song)}
        onPress={() => {
          startRadio(song);
          closeMenu();
        }}
        title={t('SongOperations.songStartRadio')}
      />
      <Menu.Item
        leadingIcon={Icons.R128GAIN}
        onPress={() =>
          Alert.alert(
            `R128Gain of ${song.parsedName}`,
            `${getR128Gain(song)} dB`,
            [
              { text: t('Dialog.nullify'), onPress: () => setR128Gain(null) },
              { text: t('Dialog.zero'), onPress: () => setR128Gain(0) },
              { text: t('Dialog.ok'), onPress: closeMenu },
            ],
            { cancelable: true },
          )
        }
        title={t('SongOperations.songR128gain')}
      />
      <ABSliderMenu song={song} closeMenu={closeMenu} />
      <Menu.Item
        leadingIcon={Icons.REMOVE_AND_BAN_BVID}
        onPress={() => removeSongs(true)}
        title={t('SongOperations.songRemoveTitle')}
      />
    </Menu>
  );
};
