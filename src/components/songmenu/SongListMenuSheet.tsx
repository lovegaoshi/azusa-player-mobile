import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useRef } from 'react';
import { Text, View, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { NoxSheetRoutes } from '@enums/Routes';
import { useNoxSetting } from '@stores/useApp';
import { SongTitle, styles } from '../player/TrackInfo/TrackInfoTemplate';
import SheetIconButton from '../commonui/bottomsheet/SheetIconButton';
import CopiedPlaylistButton from './CopiedPlaylistButton';
import SheetIconEntry from '@components/commonui/bottomsheet/SheetIconEntry';
import usePlaylistCRUD from '@hooks/usePlaylistCRUD';
import RenameSongButton from './RenameSongButton';
import useSongOperations from '@hooks/useSongOperations';
import radioAvailable from '@utils/radiofetch/fetch';
import useSnack from '@stores/useSnack';
import useBiliSearch from '@hooks/useBiliSearch';

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
  const sheet = useRef<TrueSheet>(null);
  const { checking, resetSelected, searchAndEnableSearch, getSelectedSongs } =
    usePlaylist;
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const { t } = useTranslation();
  const setSnack = useSnack(state => state.setSnack);
  const songMenuSongIndexes = useNoxSetting(state => state.songMenuSongIndexes);
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const playlistCRUD = usePlaylistCRUD(currentPlaylist);
  const setPlaylistSearchAutoFocus = useNoxSetting(
    state => state.setPlaylistSearchAutoFocus,
  );
  const { startRadio } = useSongOperations();
  const { setSearchVal, handleSearch } = useBiliSearch({});

  const showSheet = (show = true) =>
    show ? sheet.current?.present() : sheet.current?.dismiss();

  const selectedSongs = () =>
    getSelectedSongs() ||
    songMenuSongIndexes.map(index => currentPlaylist.songList[index]);

  const songs = selectedSongs();
  const song = songs[0];

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
    playlistCRUD.updateSongIndex(
      songMenuSongIndexes[0],
      {
        name,
        parsedName: name,
      },
      currentPlaylist,
    );

  const onRadioPressed = () => {
    startRadio(song);
    showSheet(false);
  };

  const removeSongs = (banBVID = false) => {
    const songs = selectedSongs();
    // TODO: figure out reanimated...
    if (songs.length === 0) {
      prepareForLayoutAnimationRender();
    }
    playlistCRUD.removeSongs(songs, banBVID, currentPlaylist);
    resetSelected();
    showSheet(false);
  };

  return (
    <TrueSheet
      name={NoxSheetRoutes.SongsMenuInListSheet}
      ref={sheet}
      backgroundColor={playerStyle.colors.surfaceVariant}
      sizes={['auto', 'large']}
      cornerRadius={5}
    >
      <View
        style={{
          paddingVertical: 15,
          paddingHorizontal: 20,
          flexDirection: 'row',
        }}
      >
        <Image
          source={song?.cover}
          style={{ width: 50, height: 50, borderRadius: 5 }}
        />
        <View style={{ paddingLeft: 5, marginTop: -10 }}>
          <SongTitle
            style={[styles.titleText, { width: '100%' }]}
            text={song?.parsedName}
          />
          <Text
            style={[
              styles.artistText,
              {
                color: playerStyle.colors.onSurfaceVariant,
                paddingLeft: 5,
              },
            ]}
            numberOfLines={1}
          >
            {song?.singer}
          </Text>
        </View>
      </View>
      <Divider />
      <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
        <CopiedPlaylistButton
          getFromListOnClick={selectedPlaylist}
          showSheet={showSheet}
        />
        <RenameSongButton
          getSongOnClick={() => selectedSongs()[0]}
          onSubmit={renameSong}
          showSheet={showSheet}
        />
      </View>
      <SheetIconEntry
        text={t('SongOperations.songStartRadio')}
        icon={'radio-tower'}
        onPress={onRadioPressed}
        disabled={!radioAvailable(song)}
      />
      <SheetIconEntry
        text={t('SongOperations.songRemoveTitle')}
        icon={'delete-forever'}
        onPress={removeSongs}
      />
      <View style={{ paddingBottom: 10 }} />
    </TrueSheet>
  );
};
