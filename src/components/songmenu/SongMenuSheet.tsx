import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useRef } from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Divider, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { NoxRoutes } from '@enums/Routes';
import { useNoxSetting } from '@stores/useApp';
import { SongTitle, styles } from '../player/TrackInfo/TrackInfoTemplate';
import { useTrackStore } from '@hooks/useActiveTrack';
import SheetIconButton from './SheetIconButton';
import CopiedPlaylistButton from './CopiedPlaylistButton';
import SheetIconEntry from './SheetIconEntry';

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

export default () => {
  const sheet = useRef<TrueSheet>(null);
  const track = useTrackStore(s => s.track);
  const song = track?.song;
  const songMenuSongIndexes = useNoxSetting(state => state.songMenuSongIndexes);
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const { t } = useTranslation();

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

  return (
    <TrueSheet
      name={NoxRoutes.SongMenuSheet}
      ref={sheet}
      sizes={['auto', 'large']}
    >
      <View
        style={{
          paddingVertical: 15,
          paddingHorizontal: 20,
          flexDirection: 'row',
        }}
      >
        <Image
          source={song.cover}
          style={{ width: 50, height: 50, borderRadius: 5 }}
        />
        <View style={{ paddingLeft: 5, marginTop: -10 }}>
          <SongTitle
            style={[styles.titleText, { width: '100%' }]}
            text={song.parsedName}
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
            {song.singer}
          </Text>
        </View>
      </View>
      <Divider />
      <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
        <CopiedPlaylistButton
          getFromListOnClick={selectedPlaylist}
          showSheet={showSheet}
        />
        <SheetIconButton
          icon={'playlist-plus'}
          onPress={() => console.log('pressed!')}
          buttonText={t('PlaylistOperations.playlistSendToTitle')}
        />
        <SheetIconButton
          icon={'playlist-plus'}
          onPress={() => console.log('pressed!')}
          buttonText={t('PlaylistOperations.playlistSendToTitle')}
        />
      </View>
      <SheetIconEntry
        text={'hello'}
        icon={'playlist-plus'}
        onPress={() => console.log('pressed!')}
      />
      <SheetIconEntry
        text={'hello'}
        icon={'playlist-plus'}
        onPress={() => console.log('pressed!')}
      />
      <SheetIconEntry
        text={'hello'}
        icon={'playlist-plus'}
        onPress={() => console.log('pressed!')}
      />
      <SheetIconEntry
        text={'hello'}
        icon={'playlist-plus'}
        onPress={() => console.log('pressed!')}
      />
      <SheetIconEntry
        text={'hello'}
        icon={'playlist-plus'}
        onPress={() => console.log('pressed!')}
      />
    </TrueSheet>
  );
};
