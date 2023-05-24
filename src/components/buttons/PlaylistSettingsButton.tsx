import React, { useState } from 'react';
import { IconButton, Menu } from 'react-native-paper';
import Dialog from '../dialogs/PlaylistSettingsDialog';

const ICON = 'pencil';

interface menuProps {
  disabled?: boolean;
  onSubmit?: (playlist: NoxMedia.Playlist) => void;
  onCancel?: () => void;
}

export default ({
  disabled = false,
  onSubmit = (playlist: NoxMedia.Playlist) => undefined,
  onCancel = () => undefined,
}: menuProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClose = () => {
    setDialogOpen(false);
    onCancel();
  };

  const handleSubmit = (playlist: NoxMedia.Playlist) => {
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
