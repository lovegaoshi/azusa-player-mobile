import React, { useState } from 'react';
import { IconButton } from 'react-native-paper';
import { GestureResponderEvent } from 'react-native';

import Menu from './PlaylistMenu';

const ICON = 'dots-horizontal';

interface Props {
  disabled?: boolean;
  playlist: NoxMedia.Playlist;
  songListUpdateHalt: () => void;
}

export default ({ disabled = false, playlist, songListUpdateHalt }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<NoxTheme.Coordinates>({
    x: 0,
    y: 0,
  });

  const handlePress = (event: GestureResponderEvent) => {
    toggleVisible();
    setMenuCoords({
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    });
  };

  const toggleVisible = () => {
    setMenuOpen(val => !val);
  };

  return (
    <React.Fragment>
      <IconButton
        icon={ICON}
        onPress={handlePress}
        size={25}
        disabled={disabled}
        //iconColor={playerStyle.colors.primary}
      />
      <Menu
        visible={menuOpen}
        toggleVisible={toggleVisible}
        menuCoords={menuCoords}
        playlist={playlist}
        songListUpdateHalt={songListUpdateHalt}
      />
    </React.Fragment>
  );
};
