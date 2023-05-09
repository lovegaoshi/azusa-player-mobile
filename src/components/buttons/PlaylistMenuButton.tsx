import React, { useState } from 'react';
import { IconButton } from 'react-native-paper';
import Dialog from '../playlist/PlaylistMenu';
import coordinates from '../../objects/Coordinate';
import { GestureResponderEvent } from 'react-native';

const ICON = 'dots-horizontal';

export default () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<coordinates>({ x: 0, y: 0 });

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
      <IconButton icon={ICON} onPress={handlePress} size={25} />
      <Dialog
        visible={dialogOpen}
        toggleVisible={toggleVisible}
        menuCoords={menuCoords}
      />
    </React.Fragment>
  );
};
