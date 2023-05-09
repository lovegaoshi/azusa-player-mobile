import React, { useState } from 'react';
import { IconButton, Menu } from 'react-native-paper';
import Dialog from '../dialogs/PlaylistSettingsDialog';
import Playlist from '../../objects/Playlist';

const ICON = 'pencil';

interface menuProps {
  disabled?: boolean;
  onSubmit?: (playlist: Playlist) => void;
  onCancel?: () => void;
}

export default ({
  disabled = false,
  onSubmit = (playlist: Playlist) => void 0,
  onCancel = () => void 0,
}: menuProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClose = () => {
    setDialogOpen(false);
    onCancel();
  };

  const handleSubmit = (playlist: Playlist) => {
    setDialogOpen(false);
    onSubmit(playlist);
  };

  return (
    <React.Fragment>
      <Menu.Item
        leadingIcon={ICON}
        onPress={() => {
          setDialogOpen(true);
        }}
        title="Settings..."
        disabled={disabled}
      />
      <Dialog
        visible={dialogOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </React.Fragment>
  );
};
