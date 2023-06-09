import * as React from 'react';
import { Menu } from 'react-native-paper';
import { Keyboard } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '../../hooks/useSetting';
import { CopiedPlaylistMenuItem } from '../buttons/CopiedPlaylistButton';
import { RenameSongMenuItem } from '../buttons/RenameSongButton';

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

interface Props {
  checking?: boolean;
  checked?: boolean[];
  resetChecked?: () => void;
  handleSearch?: (val: string) => void;
}

export default ({
  checking = false,
  checked = [],
  resetChecked = () => undefined,
  handleSearch = () => undefined,
}: Props) => {
  const { t } = useTranslation();
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
      title:
        songs.length > 1
          ? t('SongOperations.selectedSongs')
          : songs[0].parsedName,
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

  // do we even want this feature anymore?
  const reloadSongs = async () => {
    return;
  };

  const removeSongs = (banBVID = false) => {
    const songs = selectedSongs();
    const newPlaylist = banBVID
      ? {
          ...currentPlaylist,
          blacklistedUrl: currentPlaylist.blacklistedUrl.concat(
            songs.map(song => song.bvid)
          ),
        }
      : currentPlaylist;
    updatePlaylist(newPlaylist, [], songs);
    setSongMenuVisible(false);
    resetChecked();
  };

  // do we even need this feature?
  // if do id like this to be like AIMP3's
  // track details page, in a seperate stack screen.
  const songInfo = () => {
    closeMenu();
  };

  return (
    <Menu visible={songMenuVisible} onDismiss={closeMenu} anchor={menuCoord}>
      <CopiedPlaylistMenuItem
        getFromListOnClick={selectedPlaylist}
        onSubmit={closeMenu}
      />
      <RenameSongMenuItem
        getSongOnClick={() => selectedSongs()[0]}
        disabled={checking}
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
        disabled={checking}
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
