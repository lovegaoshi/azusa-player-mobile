import * as React from 'react';
import {
  Checkbox,
  IconButton,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import { View, GestureResponderEvent, StyleSheet } from 'react-native';
import { useNoxSetting } from '@stores/useApp';
import { seconds2MMSS } from '@utils/Utils';
import NoxCache from '@utils/Cache';

interface UsePlaylist {
  playSong: (song: NoxMedia.Song) => void;
  checking: boolean;
  selected: boolean[];
}

interface Props {
  item: NoxMedia.Song;
  index: number;
  currentPlaying: boolean;
  usePlaylist: UsePlaylist;
  onLongPress?: () => void;
  onChecked?: () => void;
  networkCellular?: boolean;
}

const SongInfo = ({
  item,
  index,
  currentPlaying,
  usePlaylist,
  onLongPress = () => undefined,
  onChecked = () => undefined,
  networkCellular = false,
}: Props) => {
  const { playSong, checking, selected } = usePlaylist;
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setSongMenuCoords = useNoxSetting(state => state.setSongMenuCoords);
  const setSongMenuVisible = useNoxSetting(state => state.setSongMenuVisible);
  const setSongMenuSongIndexes = useNoxSetting(
    state => state.setSongMenuSongIndexes
  );

  const title =
    playerSetting.parseSongName &&
    currentPlaylist.type !== NoxEnum.Playlist.PlaylistEnums.TYPE_SEARCH_PLAYLIST
      ? item.parsedName
      : item.name;
  const id = item.id;
  let artist = item.singer;
  artist =
    item.album && item.parsedName !== item.album
      ? artist + ' - ' + item.album
      : artist;

  const [, setChecked] = React.useState(false);

  const toggleCheck = () => {
    setChecked(val => !val);
    onChecked();
  };

  const getSongIndex = () => {
    // HACK: :index is no longer reliable because currentRow may filter view.
    // either make filtered view a global state, or do this every time.
    // which I dont think its terribly bad?
    return currentPlaylist.songList.findIndex(song => song.id === id);
  };
  const checked = selected[getSongIndex()];

  const isItemSolid = () => {
    if (item.liveStatus === false) return false;
    if (!networkCellular) return true;
    if (playerSetting.dataSaver && !NoxCache.noxMediaCache?.peekCache(item)) {
      return false;
    }
    return true;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: currentPlaying
            ? playerStyle.customColors.playlistDrawerBackgroundColorTransparent
            : 'transparent',
          opacity: isItemSolid() ? undefined : 0.5,
        },
      ]}
    >
      <TouchableRipple
        onLongPress={checking ? toggleCheck : onLongPress}
        onPress={checking ? toggleCheck : () => playSong(item)}
      >
        <View style={styles.row}>
          <View style={{ flex: 5 }}>
            <View style={styles.row}>
              {checking && (
                <View style={{ flex: 1 }}>
                  <Checkbox
                    status={checked ? 'checked' : 'unchecked'}
                    onPress={toggleCheck}
                  />
                </View>
              )}
              <View style={{ flex: 4.9 }}>
                <Text variant="bodyLarge" numberOfLines={3}>{`${String(
                  index + 1
                  // ${' (' + item.source + ')' || ''}
                )}. ${title}`}</Text>
                <Text
                  variant="bodySmall"
                  style={{ color: playerStyle.colors.secondary }}
                  numberOfLines={1}
                >
                  {artist}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.row}>
            <Text variant="titleSmall" style={styles.time}>
              {seconds2MMSS(item.duration)}
            </Text>
            <IconButton
              icon="dots-vertical"
              onPress={(event: GestureResponderEvent) => {
                setSongMenuSongIndexes([getSongIndex()]);
                setSongMenuVisible(true);
                setSongMenuCoords({
                  x: event.nativeEvent.pageX,
                  y: event.nativeEvent.pageY,
                });
              }}
              size={20}
            />
          </View>
        </View>
      </TouchableRipple>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 5,
    paddingBottom: 5,
    borderRadius: 5,
    paddingLeft: 10,
  },
  row: {
    flexDirection: 'row',
  },
  time: {
    top: 13,
  },
});

export default SongInfo;
