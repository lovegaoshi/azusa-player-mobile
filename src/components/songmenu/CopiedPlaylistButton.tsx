import React, { useState } from 'react';
import { Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import Dialog from '../dialogs/CopiedPlaylistDialog';
import { dummyPlaylistList } from '@objects/Playlist';
import SheetIconButton from './SheetIconButton';

const ICON = 'playlist-plus';

interface MenuProps {
  getFromListOnClick: () => NoxMedia.Playlist;
  onSubmit?: () => void;
  onCancel?: () => void;
  showSheet?: (v: boolean) => void;
}
export default ({
  getFromListOnClick,
  onSubmit = () => undefined,
  onCancel = () => undefined,
  showSheet,
}: MenuProps) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fromList, setFromList] =
    useState<NoxMedia.Playlist>(dummyPlaylistList);

  const handleClose = () => {
    setDialogOpen(false);
    onCancel();
    showSheet?.(true);
  };

  const handleSubmit = () => {
    setDialogOpen(false);
    onSubmit();
  };

  return (
    <SheetIconButton
      icon={ICON}
      onPress={() => {
        setDialogOpen(true);
        setFromList(getFromListOnClick());
        showSheet?.(false);
      }}
      buttonText={t('PlaylistOperations.playlistSendToTitle')}
    >
      <Dialog
        visible={dialogOpen}
        fromList={fromList}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </SheetIconButton>
  );
};
