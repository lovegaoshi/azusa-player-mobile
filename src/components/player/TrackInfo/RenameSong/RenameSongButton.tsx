import React, { useState } from 'react';
import { Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import Dialog from './RenameSongDialog';
import { dummySongObj } from '@objects/Song';

const ICON = 'pencil';

interface MenuProps {
  getSongOnClick: () => NoxMedia.Song;
  disabled?: boolean;
  onSubmit?: (rename: string) => void;
  onCancel?: () => void;
}

export default function RenameSongButton({
  getSongOnClick,
  disabled = false,
  onSubmit = (rename: string) => console.log(rename),
  onCancel = () => undefined,
}: MenuProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [song, setSong] = useState(dummySongObj);

  const handleClose = () => {
    setDialogOpen(false);
    onCancel();
  };

  const handleSubmit = (rename: string) => {
    setDialogOpen(false);
    onSubmit(rename);
  };

  return (
    <React.Fragment>
      <Menu.Item
        leadingIcon={ICON}
        onPress={() => {
          setDialogOpen(true);
          setSong(getSongOnClick());
        }}
        title={t('SongOperations.songRenameTitle')}
        disabled={disabled}
      />
      <Dialog
        visible={dialogOpen}
        song={song}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </React.Fragment>
  );
}
