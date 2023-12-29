import React, { useEffect, useState } from 'react';
import { GestureResponderEvent, View } from 'react-native';
import { IconButton } from 'react-native-paper';

import { useNoxSetting } from '@stores/useApp';
import SongMenu from './SongMenu';

export default ({ track }: NoxComponent.TrackProps) => {
  const song = track?.song as NoxMedia.Song;
  const [songMenuVisible, setSongMenuVisible] = useState(false);
  // TODO: this is calculated at TrackInfo as well. its time to put the songIndex
  // to a store too, lastPlayID only records song ID.
  // but... get a better phone?
  const [songMenuSongIndex, setSongMenuSongIndex] = useState(-1);
  const [menuCoords, setMenuCoords] = useState<NoxTheme.coordinates>({
    x: 0,
    y: 0,
  });
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const playerStyle = useNoxSetting(state => state.playerStyle);

  const handlePress = (event: GestureResponderEvent) => {
    setSongMenuVisible(true);
    setMenuCoords({
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    });
  };

  useEffect(() => {
    setSongMenuSongIndex(
      currentPlayingList.songList.findIndex(
        listSong => listSong.id === song?.id
      )
    );
  }, [song]);

  return (
    <View>
      <IconButton
        icon="dots-vertical"
        size={30}
        onPress={handlePress}
        disabled={song === undefined}
        theme={{ colors: { onSurfaceVariant: playerStyle.colors.primary } }}
      />
      <SongMenu
        song={song}
        songMenuVisible={songMenuVisible}
        setSongMenuVisible={setSongMenuVisible}
        songMenuSongIndexes={[songMenuSongIndex]}
        menuCoords={menuCoords}
      ></SongMenu>
    </View>
  );
};
