import React from 'react';
import { IconButton } from 'react-native-paper';
import { ViewStyle } from 'react-native';

import Dialog from '../dialogs/NewPlaylistDialog';

const ICON = 'plus-circle-outline';

interface Props {
  fromList?: NoxMedia.Playlist;
  icon?: string;
  style?: ViewStyle;
  open: boolean;
  setOpen: (v: boolean) => void;
}

export default ({
  fromList,
  icon = ICON,
  style = {},
  open,
  setOpen,
}: Props) => {
  return (
    <React.Fragment>
      <IconButton icon={icon} onPress={() => setOpen(true)} style={style} />
      <Dialog
        visible={open}
        fromList={fromList}
        onClose={() => setOpen(false)}
        onSubmit={() => setOpen(false)}
      />
    </React.Fragment>
  );
};
