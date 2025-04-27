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
      <View style={{ flexDirection: 'row' }}>
        <SheetIconButton
          icon={'playlist-plus'}
          onPress={() => console.log('pressed!')}
          buttonText="PlaylistOperations.playlistSendToTitle"
        />
        <SheetIconButton
          icon={'playlist-plus'}
          onPress={() => console.log('pressed!')}
          buttonText="PlaylistOperations.playlistSendToTitle"
        />
        <SheetIconButton
          icon={'playlist-plus'}
          onPress={() => console.log('pressed!')}
          buttonText="PlaylistOperations.playlistSendToTitle"
        />
      </View>
      <Text> Hello </Text>
      <Text> Hello </Text>
      <Text> Hello </Text>
      <Text> Hello </Text>
      <Text> Hello </Text>
      <Text> Hello </Text>
    </TrueSheet>
  );
};
