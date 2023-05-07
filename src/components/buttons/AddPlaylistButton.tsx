import React, { useImperativeHandle, useState } from 'react';
import { IconButton } from 'react-native-paper';
import Dialog from '../dialogs/NewPlaylistDialog';
import Playlist from '../../objects/Playlist';

const ICON = 'plus-circle-outline';

export default React.forwardRef(
  (
    {
      fromList,
      icon = ICON,
      size = 30,
      style = { position: 'absolute', right: 100 },
    }: {
      fromList?: Playlist;
      icon?: string;
      size?: number;
      // TODO: really object?
      style?: object;
    },
    ref
  ) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    useImperativeHandle(ref, () => ({ setOpen: () => setDialogOpen(true) }), [
      dialogOpen,
    ]);

    return (
      <React.Fragment>
        <IconButton
          icon={icon}
          onPress={() => setDialogOpen(true)}
          size={size}
          style={style}
        />
        <Dialog
          visible={dialogOpen}
          fromList={fromList}
          onClose={() => setDialogOpen(false)}
          onSubmit={() => setDialogOpen(false)}
        />
      </React.Fragment>
    );
  }
);
