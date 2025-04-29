import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Dialog from '@components/player/TrackInfo/RenameSong/RenameSongDialog';
import { dummySongObj } from '@objects/Song';
import SheetIconButton from '../commonui/bottomsheet/SheetIconButton';

const ICON = 'pencil';

interface Props {
  getSongOnClick: () => NoxMedia.Song;
  disabled?: boolean;
  onSubmit?: (rename: string) => void;
  onCancel?: () => void;
  showSheet?: (v: boolean) => void;
}

export default ({
  getSongOnClick,
  disabled = false,
  onSubmit = (rename: string) => console.log(rename),
  onCancel = () => undefined,
  showSheet,
}: Props) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [song, setSong] = useState(dummySongObj);

  const handleClose = () => {
    setDialogOpen(false);
    onCancel();
    showSheet?.(true);
  };

  const handleSubmit = (rename: string) => {
    setDialogOpen(false);
    onSubmit(rename);
  };

  return (
    <SheetIconButton
      icon={ICON}
      onPress={() => {
        setDialogOpen(true);
        setSong(getSongOnClick());
        showSheet?.(false);
      }}
      text={t('SongOperations.songRenameTitle')}
      disabled={disabled}
    >
      <Dialog
        visible={dialogOpen}
        song={song}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </SheetIconButton>
  );
};
