import React, { useState } from 'react';
import { Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import Dialog from '../dialogs/CopiedPlaylistDialog';
import { dummyPlaylistList } from '@objects/Playlist';

const ICON = 'playlist-plus';

interface MenuProps {
  getFromListOnClick: () => NoxMedia.Playlist;
  onSubmit?: () => void;
  onCancel?: () => void;
}
export const CopiedPlaylistMenuItem = ({
  getFromListOnClick,
  onSubmit = () => undefined,
  onCancel = () => undefined,
}: MenuProps) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fromList, setFromList] =
    useState<NoxMedia.Playlist>(dummyPlaylistList);

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
        title={t('PlaylistOperations.playlistSendToTitle')}
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
