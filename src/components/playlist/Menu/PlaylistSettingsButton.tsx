import React, { useState } from 'react';
import { Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import Dialog from './PlaylistSettingsDialog';

const ICON = 'pencil';

interface Props {
  disabled?: boolean;
  onSubmit?: (playlist: NoxMedia.Playlist) => void;
  onCancel?: () => void;
  playlist: NoxMedia.Playlist;
}

export default ({
  disabled = false,
  onSubmit = () => undefined,
  onCancel = () => undefined,
  playlist,
}: Props) => {
  const { t } = useTranslation();
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
        title={t('PlaylistOperations.playlistSettingsTitle')}
        disabled={disabled}
      />
      <Dialog
        playlist={playlist}
        visible={dialogOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </React.Fragment>
  );
};
