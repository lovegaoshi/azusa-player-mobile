import React, { useState } from 'react';
import { IconButton, Menu } from 'react-native-paper';
import Dialog from '../dialogs/CopiedPlaylistDialog';
import Playlist, { dummyPlaylistList } from '../../objects/Playlist';

const ICON = 'playlist-plus';

export const CopiedPlaylistButton = ({ fromList }: { fromList: Playlist }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <React.Fragment>
      <IconButton
        icon={ICON}
        onPress={() => setDialogOpen(true)}
        mode="contained"
        size={30}
        style={{ top: 10 }}
      />
      <Dialog
        visible={dialogOpen}
        fromList={fromList}
        onClose={() => setDialogOpen(false)}
        onSubmit={() => setDialogOpen(false)}
      />
    </React.Fragment>
  );
};

interface menuProps {
  getFromListOnClick: () => Playlist;
  onSubmit?: () => void;
  onCancel?: () => void;
}
export const CopiedPlaylistMenuItem = ({
  getFromListOnClick,
  onSubmit = () => void 0,
  onCancel = () => void 0,
}: menuProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fromList, setFromList] = useState<Playlist>(dummyPlaylistList);

  const handleClose = () => {
    setDialogOpen(false);
    onCancel();
  };

  const handleSubmit = () => {
    setDialogOpen(false);
    onSubmit();
  };

  return (
    <React.Fragment>
      <Menu.Item
        leadingIcon={ICON}
        onPress={() => {
          setDialogOpen(true);
          setFromList(getFromListOnClick());
        }}
        title="Send to..."
      />
      <Dialog
        visible={dialogOpen}
        fromList={fromList}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </React.Fragment>
  );
};
