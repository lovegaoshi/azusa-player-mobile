import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Dialog from '@components/dialogs/SetMVDialog';
import { dummySongObj } from '@objects/Song';
import SheetIconEntry from '@components/commonui/bottomsheet/SheetIconEntry';

const ICON = 'video';

interface Props {
  getSongOnClick: () => NoxMedia.Song;
  disabled?: boolean;
  onSubmit?: (s: Partial<NoxMedia.Song>) => void;
  onCancel?: () => void;
  showSheet?: (v: boolean) => void;
}

export default function SetMVButton({
  getSongOnClick,
  disabled = false,
  onSubmit = s => console.log(s),
  onCancel = () => undefined,
  showSheet,
}: Props) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [song, setSong] = useState(dummySongObj);

  const handleClose = () => {
    setDialogOpen(false);
    onCancel();
    showSheet?.(true);
  };

  const handleSubmit = (s: Partial<NoxMedia.Song>) => {
    setDialogOpen(false);
    onSubmit(s);
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
}
