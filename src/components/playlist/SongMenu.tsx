import * as React from 'react';
import { Menu } from 'react-native-paper';
import { useNoxSetting } from '../../hooks/useSetting';
import { CopiedPlaylistMenuItem } from '../buttons/CopiedPlaylistButton';
import { RenameSongMenuItem } from '../buttons/RenameSongButton';
import Playlist from '../../objects/Playlist';

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
}

interface props {
  checking?: boolean;
  checked?: boolean[];
  resetChecked?: () => void;
  handleSearch?: (val: string) => void;
}

export default ({
  checking = false,
  checked = [],
  resetChecked = () => void 0,
  handleSearch = () => void 0,
}: props) => {
  const songMenuVisible = useNoxSetting(state => state.songMenuVisible);
  const setSongMenuVisible = useNoxSetting(state => state.setSongMenuVisible);
  const menuCoord = useNoxSetting(state => state.songMenuCoords);
  const songMenuSongIndexes = useNoxSetting(state => state.songMenuSongIndexes);
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);

  const closeMenu = React.useCallback(() => setSongMenuVisible(false), []);

  const selectedSongIndexes = () => {
    if (checking) {
      const result = checked
        .map((val, index) => {
          if (val) {
            return index;
          }
        })
        .filter(val => val !== undefined);
      if (result.length > 0) {
        return result;
      }
    }
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
      title: songs.length > 1 ? 'Selected songs' : songs[0].parsedName,
    };
  };

  const renameSong = (rename: string) => {
    const newPlaylist = {
      ...currentPlaylist,
      songList: Array.from(currentPlaylist.songList),
    };
    newPlaylist.songList[songMenuSongIndexes[0]] = {
      ...newPlaylist.songList[songMenuSongIndexes[0]],
      name: rename,
      parsedName: rename,
    };
    updatePlaylist(newPlaylist, [], []);
  };

  return (
    <Menu visible={songMenuVisible} onDismiss={closeMenu} anchor={menuCoord}>
      <CopiedPlaylistMenuItem
        getFromListOnClick={selectedPlaylist}
        onSubmit={closeMenu}
      />
      <Menu.Item
        leadingIcon={ICONS.REMOVE}
        onPress={() => {
          // TODO: necessary to add an alert dialog?
          updatePlaylist(currentPlaylist, [], selectedSongs());
          setSongMenuVisible(false);
          resetChecked();
        }}
        title="Remove"
      />
      <RenameSongMenuItem
        getSongOnClick={() => selectedSongs()[0]}
        disabled={checking}
        onSubmit={renameSong}
      />
      <Menu.Item
        leadingIcon={ICONS.SEARCH_IN_PLAYLIST}
        onPress={() => {
          handleSearch(
            currentPlaylist.songList[songMenuSongIndexes[0]].parsedName
          );
          closeMenu();
        }}
        disabled={checking}
        title="Search in Playlist"
      />
      <Menu.Item
        leadingIcon={ICONS.RELOAD}
        onPress={closeMenu}
        title="Reload BVID"
      />
      <Menu.Item
        leadingIcon={ICONS.REMOVE_AND_BAN_BVID}
        onPress={closeMenu}
        title="Remove and BAN"
      />
    </Menu>
  );
};
