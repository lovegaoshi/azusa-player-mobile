import React, { useState } from 'react';
import { IconButton } from 'react-native-paper';
import { GestureResponderEvent } from 'react-native';

import Dialog from './PlaylistMenu';
import { useNoxSetting } from '@stores/useApp';

const ICON = 'dots-horizontal';

interface Props {
  disabled?: boolean;
  playlist: NoxMedia.Playlist;
  songListUpdateHalt: () => void;
}

export default ({ disabled = false, playlist, songListUpdateHalt }: Props) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<NoxTheme.coordinates>({
    x: 0,
    y: 0,
  });

  const handlePress = (event: GestureResponderEvent) => {
    setDialogOpen(true);
    setMenuCoords({
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    });
  };

  const toggleVisible = () => {
    setDialogOpen(val => !val);
  };

  return (
    <React.Fragment>
      <IconButton
        icon={ICON}
        onPress={handlePress}
        size={25}
        disabled={disabled}
        iconColor={playerStyle.colors.primary}
      />
      <Dialog
        visible={dialogOpen}
        toggleVisible={toggleVisible}
        menuCoords={menuCoords}
        playlist={playlist}
        songListUpdateHalt={songListUpdateHalt}
      />
    </React.Fragment>
  );
};
