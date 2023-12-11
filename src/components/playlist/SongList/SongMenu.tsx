import * as React from 'react';
import { Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';
import usePlaylistCRUD from '@hooks/usePlaylistCRUD';
import { CopiedPlaylistMenuItem } from '@components/buttons/CopiedPlaylistButton';
import RenameSongButton from '@components/player/TrackInfo/RenameSong/RenameSongButton';
import useSongOperations from '@hooks/useSongOperations';
enum ICONS {
  SEND_TO = 'playlist-plus',
  COPY_SONG_NAME = '',
  SEARCH_IN_PLAYLIST = 'text-search',
  RELOAD = 'refresh',
  REMOVE = 'delete',
  REMOVE_AND_BAN_BVID = 'delete-forever',
  DETAIL = 'information-outline',
  RADIO = 'radio-tower',
}

interface UsePlaylist {
  checking: boolean;
  resetSelected: () => void;
  searchAndEnableSearch: (val: string) => void;
  getSelectedSongs: () => NoxMedia.Song[] | undefined;
}

interface Props {
  usePlaylist: UsePlaylist;
  prepareForLayoutAnimationRender: () => void;
}

export default ({ usePlaylist, prepareForLayoutAnimationRender }: Props) => {
  const { checking, resetSelected, searchAndEnableSearch, getSelectedSongs } =
    usePlaylist;
  const { t } = useTranslation();
  const songMenuVisible = useNoxSetting(state => state.songMenuVisible);
  const setSongMenuVisible = useNoxSetting(state => state.setSongMenuVisible);
  const menuCoord = useNoxSetting(state => state.songMenuCoords);
  const songMenuSongIndexes = useNoxSetting(state => state.songMenuSongIndexes);
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const playlistCRUD = usePlaylistCRUD();
  const { updateSongIndex } = playlistCRUD;
  const setPlaylistSearchAutoFocus = useNoxSetting(
    state => state.setPlaylistSearchAutoFocus
  );
  const { startRadio, radioAvailable } = useSongOperations();

  const closeMenu = React.useCallback(() => setSongMenuVisible(false), []);

  const selectedSongs = () => {
    return (
      getSelectedSongs() ||
      songMenuSongIndexes.map(index => currentPlaylist.songList[index!])
    );
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

  const renameSong = (name: string) =>
    updateSongIndex(songMenuSongIndexes[0], {
      name,
      parsedName: name,
    });

  const removeSongs = (banBVID = false) => {
    const songs = selectedSongs();
    // TODO: figure out reanimated...
    if (songs.length === 0) {
      prepareForLayoutAnimationRender();
    }
    playlistCRUD.removeSongs(songs, banBVID, currentPlaylist);
    setSongMenuVisible(false);
    resetSelected();
  };

  return (
    <Menu visible={songMenuVisible} onDismiss={closeMenu} anchor={menuCoord}>
      <CopiedPlaylistMenuItem
        getFromListOnClick={selectedPlaylist}
        onSubmit={closeMenu}
      />
      <RenameSongButton
        getSongOnClick={() => selectedSongs()[0]}
        disabled={checking}
        onSubmit={(rename: string) => {
          closeMenu();
          renameSong(rename);
        }}
      />
      <Menu.Item
        leadingIcon={ICONS.RADIO}
        disabled={checking || !radioAvailable(selectedSongs()[0])}
        onPress={() => {
          startRadio(selectedSongs()[0]);
          closeMenu();
        }}
        title={t('SongOperations.songStartRadio')}
      />
      <Menu.Item
        leadingIcon={ICONS.SEARCH_IN_PLAYLIST}
        onPress={() => {
          searchAndEnableSearch(
            currentPlaylist.songList[songMenuSongIndexes[0]].parsedName
          );
          closeMenu();
          setPlaylistSearchAutoFocus(false);
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
      {__DEV__ && (
        <Menu.Item
          leadingIcon={ICONS.REMOVE_AND_BAN_BVID}
          onPress={() => console.log(selectedSongs())}
          title={'console.log'}
        />
      )}
    </Menu>
  );
};
