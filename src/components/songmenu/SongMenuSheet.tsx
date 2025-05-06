import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useRef } from 'react';
import { Text, View, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
import { addR128Gain, getR128Gain } from '@utils/ffmpeg/r128Store';
import usePlayback from '@hooks/usePlayback';
import ABSliderMenu from './ABSliderMenu';
import VolumeSlider from './VolumeSlider';

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
  const playlistCRUD = usePlaylistCRUD();

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

  const onR128Gain = () => {
    showSheet(false);
    Alert.alert(
      `R128Gain of ${song.parsedName}`,
      `${getR128Gain(song)} dB`,
      [
        { text: t('Dialog.nullify'), onPress: () => addR128Gain(song, null) },
        { text: t('Dialog.zero'), onPress: () => addR128Gain(song, 0) },
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
    <NoxBottomSheet name={NoxSheetRoutes.SongMenuSheet} ref={sheet}>
      <GestureHandlerRootView>
        <VolumeSlider />
        <View
          style={{
            paddingVertical: 15,
            paddingHorizontal: 20,
            flexDirection: 'row',
          }}
        >
          <Image
            source={{ uri: song?.cover, width: 100, height: 100 }}
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
            getSongOnClick={() => song}
            onSubmit={renameSong}
            showSheet={showSheet}
          />
          <SheetIconButton
            icon={'refresh'}
            onPress={reloadSong}
            text={t('SongOperations.reloadSong')}
          />
        </View>
        <SheetIconEntry
          text={t('SongOperations.songStartRadio')}
          icon={'radio-tower'}
          onPress={onRadioPressed}
          disabled={!radioAvailable(song)}
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
      </GestureHandlerRootView>
    </NoxBottomSheet>
  );
};
