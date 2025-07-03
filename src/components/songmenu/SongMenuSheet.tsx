import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useRef, useState } from 'react';
import { View, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';

import { NativeText as Text } from '@components/commonui/ScaledText';
import { NoxSheetRoutes } from '@enums/Routes';
import { useNoxSetting } from '@stores/useApp';
import { SongTitle, styles } from '../player/TrackInfo/TrackInfoTemplate';
import { useTrackStore } from '@hooks/useActiveTrack';
import SheetIconButton from '../commonui/bottomsheet/SheetIconButton';
import CopiedPlaylistButton from './CopiedPlaylistButton';
import SheetIconEntry from '@components/commonui/bottomsheet/SheetIconEntry';
import NoxBottomSheet from '@components/commonui/bottomsheet/NoxBottomSheet';
import usePlaylistCRUD from '@hooks/usePlaylistCRUD';
import RenameSongButton from './RenameSongButton';
import useSongOperations from '@hooks/useSongOperations';
import radioAvailable from '@utils/mediafetch/radiofetch';
import { getR128Gain } from '@utils/db/sqlAPI';
import { setR128Gain } from '@utils/db/sqlStorage';
import usePlayback from '@hooks/usePlayback';
import ABSliderMenu from './ABSliderMenu';
import VolumeSlider from './VolumeSlider';
import { isAndroid } from '@utils/RNUtils';
import { songExport2URL } from '@utils/mediafetch/resolveURL';
import useSnack from '@stores/useSnack';

export default () => {
  const sheet = useRef<TrueSheet>(null);
  const track = useTrackStore(s => s.track);
  const song = track?.song;
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const { t } = useTranslation();
  const updateTrack = useTrackStore(state => state.updateTrack);
  const getPlaylist = useNoxSetting(state => state.getPlaylist);
  const { startRadio } = useSongOperations();
  const { playFromPlaylist } = usePlayback();
  const setSnack = useSnack(state => state.setSnack);
  const playlistCRUD = usePlaylistCRUD();
  const [draggable, setDraggable] = useState(true);

  const showSheet = (show = true) =>
    show ? sheet.current?.present() : sheet.current?.dismiss();

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
    playlistCRUD.updateSongIndex(playlistCRUD.findSongIndex(song), {
      name,
      parsedName: name,
    });
    updateTrack({ title: name, song: { ...song, name, parsedName: name } });
  };

  const reloadSong = async () => {
    showSheet(false);
    const currentPlaylist2 = await getPlaylist(currentPlaylist.id);
    const metadata = await playlistCRUD.updateSongMetadata(
      playlistCRUD.findSongIndex(song),
      currentPlaylist2,
    );
    updateTrack({
      title: metadata.name,
      artwork: metadata.cover,
    });
    return metadata;
  };

  const onRadioPressed = () => {
    startRadio(song);
    showSheet(false);
  };

  const onR128Gain = async () => {
    showSheet(false);
    Alert.alert(
      `R128Gain of ${song.parsedName}`,
      `${await getR128Gain(song.id)} dB`,
      [
        {
          text: t('Dialog.nullify'),
          onPress: () => setR128Gain(song.id, null),
        },
        { text: t('Dialog.zero'), onPress: () => setR128Gain(song.id, 0) },
        { text: t('Dialog.ok') },
      ],
      { cancelable: true },
    );
  };

  const removeSongs = async (banBVID = true) => {
    showSheet(false);
    playFromPlaylist({
      playlist: await playlistCRUD.removeSongs([song], banBVID),
    });
  };

  return (
    <NoxBottomSheet
      draggable={draggable}
      name={NoxSheetRoutes.SongMenuSheet}
      ref={sheet}
    >
      {isAndroid && (
        <VolumeSlider
          onValueStart={() => setDraggable(false)}
          onValueEnd={() => setDraggable(true)}
        />
      )}
      <View
        style={{
          paddingVertical: 15,
          paddingHorizontal: 20,
          flexDirection: 'row',
        }}
      >
        <Image
          source={{ uri: song?.cover, width: 250, height: 250 }}
          style={{ width: 50, height: 50, borderRadius: 5 }}
        />
        <View style={{ paddingLeft: 5, marginTop: -10 }}>
          <SongTitle
            style={[styles.titleText, { paddingRight: 35 }]}
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
          getSongOnClick={() => song}
          onSubmit={renameSong}
          showSheet={showSheet}
        />
        <SheetIconButton
          icon={'share'}
          onPress={() => {
            Clipboard.setStringAsync(songExport2URL(song));
            setSnack({
              snackMsg: { success: t('SongOperations.songShared', { song }) },
            });
            showSheet(false);
          }}
          text={t('SongOperations.share')}
        />
      </View>
      <SheetIconEntry
        text={t('SongOperations.songStartRadio')}
        icon={'radio-tower'}
        onPress={onRadioPressed}
        disabled={!radioAvailable(song)}
      />
      <SheetIconEntry
        text={t('SongOperations.reloadSong')}
        icon={'refresh'}
        onPress={reloadSong}
      />
      <SheetIconEntry
        text={t('SongOperations.songR128gain')}
        icon={'replay'}
        onPress={onR128Gain}
      />
      <ABSliderMenu song={song} showSheet={showSheet} />
      <SheetIconEntry
        text={t('SongOperations.songRemoveTitle')}
        icon={'delete-forever'}
        onPress={removeSongs}
      />
    </NoxBottomSheet>
  );
};
