import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Dialog from '@components/dialogs/SetMVDialog';
import { dummySongObj } from '@objects/Song';
import SheetIconEntry from '@components/commonui/bottomsheet/SheetIconEntry';

const ICON = 'video';

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
    <SheetIconEntry
      icon={ICON}
      onPress={() => {
        setDialogOpen(true);
        setSong(getSongOnClick());
        showSheet?.(false);
      }}
      text={t('SongOperations.setMV')}
      disabled={disabled}
    >
      <Dialog
        visible={dialogOpen}
        song={song}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </SheetIconEntry>
  );
};
