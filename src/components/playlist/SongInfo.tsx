import * as React from 'react';
import { Checkbox, IconButton, Text } from 'react-native-paper';
import { View, Pressable, GestureResponderEvent } from 'react-native';
import { useNoxSetting } from '../../hooks/useSetting';
import { styles } from '../style';
import Song from '../../objects/SongInterface';
import { seconds2MMSS } from '../../utils/Utils';

function SongInfo({
  item,
  index,
  currentPlaying,
  playSong,
  checking = false,
  checkedProp = false,
  onChecked = () => void 0,
}: {
  item: Song;
  index: number;
  currentPlaying: boolean;
  playSong: (song: Song) => void;
  checking?: boolean;
  checkedProp?: boolean;
  onChecked?: () => void;
}) {
  const [title, id, artist] = [item.parsedName, item.id, item.singer];
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const setSongMenuCoords = useNoxSetting(state => state.setSongMenuCoords);
  const setSongMenuVisible = useNoxSetting(state => state.setSongMenuVisible);
  const setSongMenuSongIndexes = useNoxSetting(
    state => state.setSongMenuSongIndexes
  );
  const [checked, setChecked] = React.useState(false);

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

  React.useEffect(() => {
    if (checked !== checkedProp) {
      setChecked(checkedProp);
    }
  }, [checkedProp]);

  return (
    <View
      style={{
        paddingTop: 5,
        paddingBottom: 5,
        flexDirection: 'row',
        backgroundColor: currentPlaying ? 'lightgrey' : 'white',
      }}
    >
      {checking && (
        <View style={{ flex: 1 }}>
          <Checkbox
            status={checked ? 'checked' : 'unchecked'}
            onPress={toggleCheck}
          />
        </View>
      )}
      <View style={{ flex: 4.9 }}>
        <Pressable onPress={checking ? toggleCheck : () => playSong(item)}>
          <Text variant="titleMedium">{`${String(index + 1)}. ${title}`}</Text>
          <Text variant="titleSmall" style={{ color: 'grey' }}>
            {artist}
          </Text>
        </Pressable>
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
            if (!checking) {
              setSongMenuSongIndexes([getSongIndex()]);
            }
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
  );
}
export default React.memo(SongInfo);
