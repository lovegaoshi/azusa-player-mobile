import * as React from 'react';
import {
  Checkbox,
  IconButton,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import { View, GestureResponderEvent } from 'react-native';
import { useNoxSetting } from '../../hooks/useSetting';
import Song from '../../objects/SongInterface';
import { seconds2MMSS } from '../../utils/Utils';

function SongInfo({
  item,
  index,
  currentPlaying,
  playSong,
  checkedList,
  checking = false,
  onChecked = () => void 0,
}: {
  item: Song;
  index: number;
  currentPlaying: boolean;
  playSong: (song: Song) => void;
  checking?: boolean;
  onChecked?: () => void;
  checkedList: boolean[];
}) {
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setSongMenuCoords = useNoxSetting(state => state.setSongMenuCoords);
  const setSongMenuVisible = useNoxSetting(state => state.setSongMenuVisible);
  const setSongMenuSongIndexes = useNoxSetting(
    state => state.setSongMenuSongIndexes
  );
  const [title, id, artist] = [
    playerSetting.parseSongName ? item.parsedName : item.name,
    item.id,
    item.singer,
  ];
  // HACK: this is just a dummy value to indicate component
  // should be refreshed.
  const [checkedState, setChecked] = React.useState(false);

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
  const checked = checkedList[getSongIndex()];

  return (
    <View
      style={{
        paddingTop: 5,
        paddingBottom: 5,
        backgroundColor: currentPlaying
          ? playerStyle.customColors.playlistDrawerBackgroundColorTransparent
          : 'transparent',
        borderRadius: 5,
        paddingLeft: 10,
      }}
    >
      <TouchableRipple onPress={checking ? toggleCheck : () => playSong(item)}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 5 }}>
            <View style={{ flexDirection: 'row' }}>
              {checking && (
                <View style={{ flex: 1 }}>
                  <Checkbox
                    status={checked ? 'checked' : 'unchecked'}
                    onPress={toggleCheck}
                  />
                </View>
              )}
              <View style={{ flex: 4.9 }}>
                <Text variant="titleMedium">{`${String(
                  index + 1
                )}. ${title}`}</Text>
                <Text
                  variant="titleSmall"
                  style={{ color: playerStyle.colors.secondary }}
                >
                  {artist}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              flex: 2,
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            <Text variant="titleSmall" style={{ top: 13 }}>
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
}
export default SongInfo;
