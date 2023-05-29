import * as React from 'react';
import { Menu } from 'react-native-paper';
import { Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';
import TrackPlayer from 'react-native-track-player';

import { useNoxSetting } from '../../../hooks/useSetting';
import { CopiedPlaylistMenuItem } from '../../buttons/CopiedPlaylistButton';
import { RenameSongMenuItem } from '../../buttons/RenameSongButton';
import { songlistToTracklist } from '../../../objects/Playlist';

enum ICONS {
  SEND_TO = 'playlist-plus',
  COPY_SONG_NAME = '',
  COPY_SONG_URL = '',
  GOTO_BILIBILI = '',
  SEARCH_IN_PLAYLIST = 'text-search',
  RENAME = '',
  RELOAD = 'refresh',
  REMOVE = 'delete',
  REMOVE_AND_BAN_BVID = 'delete-forever',
  DETAIL = 'information-outline',
}

interface props {
  songMenuVisible: boolean;
  setSongMenuVisible: (val: boolean) => void;
  songMenuSongIndexes: [number];
  menuCoords?: NoxTheme.coordinates;
  handleSearch?: (val: string) => void;
}

export default ({
  songMenuVisible,
  setSongMenuVisible,
  songMenuSongIndexes,
  menuCoords = { x: 0, y: 0 },
  handleSearch = () => undefined,
}: props) => {
  const { t } = useTranslation();
  const currentPlaylist = useNoxSetting(state => state.currentPlayingList);
  const playlists = useNoxSetting(state => state.playlists);
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);
  const setCurrentPlayingId = useNoxSetting(state => state.setCurrentPlayingId);
  const setCurrentPlayingList = useNoxSetting(
    state => state.setCurrentPlayingList
  );

  const closeMenu = React.useCallback(() => setSongMenuVisible(false), []);

  const selectedSongIndexes = () => {
    return songMenuSongIndexes;
  };

  const selectedSongs = () => {
    return selectedSongIndexes().map(index => currentPlaylist.songList[index!]);
  };

  const selectedPlaylist = () => {
    const songs = selectedSongs();
    return {
      ...currentPlaylist,
      songList: songs,
      title:
        songs.length > 1
          ? t('SongOperations.selectedSongs')
          : songs[0].parsedName,
    };
  };

  const renameSong = (rename: string) => {
    const currentPlaylist2 = playlists[currentPlaylist.id];
    const newPlaylist = {
      ...currentPlaylist2,
      songList: Array.from(currentPlaylist2.songList),
    };
    newPlaylist.songList[songMenuSongIndexes[0]] = {
      ...newPlaylist.songList[songMenuSongIndexes[0]],
      name: rename,
      parsedName: rename,
    };
    updatePlaylist(newPlaylist, [], []);
  };

  const removeSongs = async (banBVID = false) => {
    const currentPlaylist2 = playlists[currentPlaylist.id];
    const songs = selectedSongs();
    const newPlaylist = banBVID
      ? {
          ...currentPlaylist2,
          blacklistedUrl: currentPlaylist2.blacklistedUrl.concat(
            songs.map(song => song.bvid)
          ),
        }
      : currentPlaylist2;
    updatePlaylist(newPlaylist, [], songs);
    console.log(newPlaylist.songList.length);
    setCurrentPlayingList(newPlaylist);

    await TrackPlayer.reset();
    if (newPlaylist.songList.length > 0) {
      const song = newPlaylist.songList[0];

      setCurrentPlayingId(song.id);
      await TrackPlayer.add(songlistToTracklist([song]));
      TrackPlayer.play();
    }

    setSongMenuVisible(false);
  };

  // do we even need this feature?
  // if do id like this to be like AIMP3's
  // track details page, in a seperate stack screen.
  const songInfo = () => {
    closeMenu();
  };

  return (
    <Menu visible={songMenuVisible} onDismiss={closeMenu} anchor={menuCoords}>
      <CopiedPlaylistMenuItem
        getFromListOnClick={selectedPlaylist}
        onSubmit={closeMenu}
      />
      <RenameSongMenuItem
        getSongOnClick={() => selectedSongs()[0]}
        onSubmit={(rename: string) => {
          closeMenu();
          renameSong(rename);
        }}
      />
      <Menu.Item
        leadingIcon={ICONS.SEARCH_IN_PLAYLIST}
        onPress={() => {
          handleSearch(
            currentPlaylist.songList[songMenuSongIndexes[0]].parsedName
          );
          closeMenu();
          // TODO: doesnt work.
          Keyboard.dismiss();
        }}
        disabled
        title={t('SongOperations.songSearchInPlaylistTitle')}
      />
      <Menu.Item
        leadingIcon={ICONS.REMOVE}
        onPress={() => removeSongs()}
        title={t('SongOperations.songRemoveTitle')}
      />
      <Menu.Item
        leadingIcon={ICONS.REMOVE_AND_BAN_BVID}
        onPress={() => removeSongs(true)}
        title={t('SongOperations.songRemoveNBanTitle')}
      />
    </Menu>
  );
};
