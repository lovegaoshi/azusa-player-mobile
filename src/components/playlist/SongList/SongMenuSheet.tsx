import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useRef } from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { NoxSheetRoutes } from '@enums/Routes';
import { useNoxSetting } from '@stores/useApp';
import {
  SongTitle,
  styles,
} from '@components/player/TrackInfo/TrackInfoTemplate';
import SheetIconButton from '@components/commonui/bottomsheet/SheetIconButton';
import CopiedPlaylistButton from '@components/songmenu/CopiedPlaylistButton';
import SheetIconEntry from '@components/commonui/bottomsheet/SheetIconEntry';
import usePlaylistCRUD from '@hooks/usePlaylistCRUD';
import RenameSongButton from '@components/songmenu/RenameSongButton';
import useSongOperations from '@hooks/useSongOperations';
import radioAvailable from '@utils/radiofetch/fetch';
import useSnack from '@stores/useSnack';
import useBiliSearch from '@hooks/useBiliSearch';
import { SearchRegex } from '@enums/Playlist';
import { Source } from '@enums/MediaFetch';
import { isAndroid10 } from '@utils/RNUtils';
import { copyCacheToDir } from '@utils/download/download';
import NoxBottomSheet from '@components/commonui/bottomsheet/NoxBottomSheet';

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

  const getTitle = () => {
    if (songs.length === 1) {
      return song?.parsedName ?? '';
    }
    return t('SongOperations.selectedSongs', {
      name: song?.parsedName ?? '',
      count: songs.length - 1,
    });
  };

  const selectedPlaylist = () => {
    // TODO: are these safe to delete?
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
    // TODO: are these safe to delete?
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
    <NoxBottomSheet name={NoxSheetRoutes.SongsMenuInListSheet} ref={sheet}>
      {songs.length === 1 && (
        <>
          <View
            style={{
              paddingVertical: 15,
              paddingHorizontal: 20,
              flexDirection: 'row',
            }}
          >
            <Image
              source={{ uri: song?.cover, width: 50, height: 50 }}
              style={{ width: 50, height: 50, borderRadius: 5 }}
            />
            <View style={{ paddingLeft: 5, marginTop: -10 }}>
              <SongTitle style={styles.titleText} text={getTitle()} />

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
        </>
      )}
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
        <SheetIconButton
          text={t('SongOperations.songSearchInPlaylistTitle')}
          icon={'text-search'}
          onPress={() => {
            searchAndEnableSearch(
              `${SearchRegex.absoluteMatch.text}${
                currentPlaylist.songList[songMenuSongIndexes[0]].parsedName
              }`,
            );
            showSheet(false);
            setPlaylistSearchAutoFocus(false);
          }}
          disabled={checking}
        />
      </View>
      <SheetIconEntry
        text={t('SongOperations.songStartRadio')}
        icon={'radio-tower'}
        onPress={onRadioPressed}
        disabled={checking || !radioAvailable(song)}
      />
      {song?.source === Source.bilivideo && (
        <SheetIconEntry
          text={t('SongOperations.BVIDSearchTitle')}
          icon={'search-web'}
          onPress={() => {
            setSearchVal(song.bvid);
            handleSearch(song.bvid);
            showSheet(false);
          }}
          disabled={checking}
        />
      )}
      {isAndroid10 && song?.source !== Source.local && (
        <SheetIconEntry
          text={t('SongOperations.songDownloadTitle')}
          icon={'file-download'}
          onPress={async () => {
            const downloadSong = async (song: NoxMedia.Song) => {
              const newPath = await copyCacheToDir({
                song,
                fsdir: playerSetting.downloadLocation,
              });
              if (!newPath) return;
              await playlistCRUD.updateSong(song, {
                localPath: newPath,
              });
            };
            showSheet(false);
            for (const song of songs) {
              await setSnack({
                snackMsg: {
                  processing: t('Download.downloading', { song }),
                  success: t('Download.downloaded', { song }),
                  fail: t('Download.downloadFailed', { song }),
                },
                processFunction: () => downloadSong(song),
              });
            }
          }}
        />
      )}
      <SheetIconEntry
        text={t('SongOperations.songRemoveTitle')}
        icon={'delete'}
        onPress={removeSongs}
      />
      <SheetIconEntry
        text={t('SongOperations.songRemoveNBanTitle')}
        icon={'delete-forever'}
        onPress={() => removeSongs(true)}
      />
      {__DEV__ && (
        <SheetIconEntry
          text={t('console.log')}
          icon={'console'}
          onPress={() => console.log(songs)}
        />
      )}
    </NoxBottomSheet>
  );
};
