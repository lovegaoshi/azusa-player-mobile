import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Dialog from './PlaylistSettingsDialog';
import SheetIconEntry from '@components/commonui/bottomsheet/SheetIconEntry';

const ICON = 'pencil';

interface Props {
  disabled?: boolean;
  onSubmit?: (playlist: NoxMedia.Playlist) => void;
  onCancel?: () => void;
  playlist: NoxMedia.Playlist;
  showSheet?: (v: boolean) => void;
}

export default function PlaylistSettingsButton({
  disabled = false,
  onSubmit = () => undefined,
  onCancel = () => undefined,
  playlist,
  showSheet,
}: Props) {
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
    <SheetIconEntry
      text={t('PlaylistOperations.playlistSettingsTitle')}
      icon={ICON}
      onPress={() => {
        setDialogOpen(true);
        showSheet?.(false);
      }}
      disabled={disabled}
    >
      <Dialog
        playlist={playlist}
        visible={dialogOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </SheetIconEntry>
  );
}
