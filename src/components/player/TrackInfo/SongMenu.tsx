import * as React from 'react';
import { Menu } from 'react-native-paper';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import TrackPlayer from 'react-native-track-player';

import { useNoxSetting } from '@hooks/useSetting';
import useUpdatePlaylist from '@hooks/useUpdatePlaylist';
import { CopiedPlaylistMenuItem } from '../../buttons/CopiedPlaylistButton';
import { RenameSongMenuItem } from '../../buttons/RenameSongButton';
import useSongOperations from '@hooks/useSongOperations';
import { addR128Gain, getR128Gain } from '@utils/ffmpeg/r128Store';
import ABSliderMenu from './ABSliderMenu';
import { songlistToTracklist } from '@utils/RNTPUtils';

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
  const setCurrentPlayingId = useNoxSetting(state => state.setCurrentPlayingId);
  const setCurrentPlayingList = useNoxSetting(
    state => state.setCurrentPlayingList
  );
  const updateTrack = useNoxSetting(state => state.updateTrack);

  const { updateSongIndex, updateSongMetadata } = useUpdatePlaylist();
  const { startRadio, radioAvailable } = useSongOperations();

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

  const renameSong = async (rename: string) => {
    const currentPlaylist2 = playlists[currentPlaylist.id];
    updateSongIndex(
      songMenuSongIndexes[0],
      { name: rename, parsedName: rename },
      currentPlaylist2
    );
    const index = await TrackPlayer.getActiveTrackIndex();
    index !== undefined &&
      (await TrackPlayer.updateMetadataForTrack(index, {
        title: rename,
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
    setCurrentPlayingList(newPlaylist);

    await TrackPlayer.reset();
    if (newPlaylist.songList.length > 0) {
      const song = newPlaylist.songList[0];

      setCurrentPlayingId(song.id);
      await TrackPlayer.add(await songlistToTracklist([song]));
      TrackPlayer.play();
    }

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
      <RenameSongMenuItem
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
