import * as React from 'react';
import {
  Checkbox,
  IconButton,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import {
  DerivedValue,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
} from 'react-native-reanimated';
import inRange from 'lodash/inRange';
import throttle from 'lodash/throttle';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

import { useNoxSetting } from '@stores/useApp';
import { seconds2MMSS } from '@utils/Utils';
import { PlaylistTypes } from '@enums/Playlist';
import NoxCache from '@utils/Cache';
import { UsePlaylistRN } from '../usePlaylistRN';
import { getArtistName } from '@objects/Song';
import { NoxSheetRoutes } from '@enums/Routes';

interface Props {
  item: NoxMedia.Song;
  index: number;
  currentPlaying: boolean;
  usePlaylist: UsePlaylistRN;
  onLongPress?: () => void;
  onChecked?: () => void;
  networkCellular?: boolean;
  cursorOffset: DerivedValue<number>;
  getLayoutY: (index: number) => number;
  dragToSelect: SharedValue<number>;
}

const isItemSolid = (
  item: NoxMedia.Song,
  networkCellular = false,
  dataSaver = false,
) => {
  if (item.liveStatus !== undefined) return item.liveStatus;
  if (!networkCellular) return true;
  if (dataSaver && !NoxCache.noxMediaCache?.peekCache(item)) {
    return false;
  }
  return true;
};

const SongInfo = ({
  item,
  index,
  currentPlaying,
  usePlaylist,
  onLongPress = () => undefined,
  onChecked = () => undefined,
  networkCellular = false,
  getLayoutY,
  cursorOffset,
  dragToSelect,
}: Props) => {
  const { playSong, checking, selected } = usePlaylist;
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setSongMenuSongIndexes = useNoxSetting(
    state => state.setSongMenuSongIndexes,
  );

  const title =
    playerSetting.parseSongName && currentPlaylist.type !== PlaylistTypes.Search
      ? item.parsedName
      : item.name;
  const id = item.id;

  const [, setChecked] = React.useState(false);

  const toggleCheck = throttle(() => {
    onChecked();
    setChecked(val => !val);
  }, 100);

  const dragToggleCheck = (min: number, max: number) => {
    if (inRange(getLayoutY(index), min, max)) {
      toggleCheck();
    }
  };

  useAnimatedReaction(
    () => cursorOffset.value,
    (c, p) => {
      if (dragToSelect.value === 0 || p === null) return;
      runOnJS(dragToggleCheck)(c, p);
    },
  );

  const getSongIndex = () => {
    // HACK: :index is no longer reliable because currentRow may filter view.
    // either make filtered view a global state, or do this every time.
    // which I dont think its terribly bad?
    return currentPlaylist.songList.findIndex(song => song.id === id);
  };
  const checked = selected[getSongIndex()];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: currentPlaying
            ? 'rgba(103, 80, 164, 0.35)'
            : 'transparent',
          opacity: isItemSolid(item, networkCellular, playerSetting.dataSaver)
            ? undefined
            : 0.5,
        },
      ]}
    >
      <TouchableRipple
        onLongPress={checking ? toggleCheck : onLongPress}
        onPress={checking ? toggleCheck : () => playSong(item)}
      >
        <View style={styles.row}>
          <View style={styles.songDetails}>
            <View style={styles.row}>
              {checking && (
                <View style={styles.checkBox}>
                  <Checkbox
                    status={checked ? 'checked' : 'unchecked'}
                    onPress={toggleCheck}
                  />
                </View>
              )}
              <View style={styles.songTitle}>
                <Text variant="bodyLarge" numberOfLines={3}>{`${String(
                  index + 1,
                )}. ${title}`}</Text>
                <Text
                  variant="bodySmall"
                  style={{ color: playerStyle.colors.onSurfaceVariant }}
                  numberOfLines={1}
                >
                  {getArtistName(item)}
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
              onPress={() => {
                setSongMenuSongIndexes([getSongIndex()]);
                TrueSheet.present(NoxSheetRoutes.SongsMenuInListSheet);
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
  songTitle: {
    flex: 4.9,
    paddingRight: 5,
  },
  checkBox: {
    flex: 1,
  },
  songDetails: { flex: 5 },
});

export default SongInfo;
