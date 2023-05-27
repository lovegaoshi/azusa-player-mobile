import React, { useState } from 'react';
import { IconButton, Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import Dialog from '../dialogs/CopiedPlaylistDialog';
import { dummyPlaylistList } from '../../objects/Playlist';

const ICON = 'playlist-plus';

export const CopiedPlaylistButton = ({
  fromList,
}: {
  fromList: NoxMedia.Playlist;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <React.Fragment>
      <IconButton
        icon={ICON}
        onPress={() => setDialogOpen(true)}
        mode="contained"
        size={30}
        style={{ top: 10 }}
      />
      <Dialog
        visible={dialogOpen}
        fromList={fromList}
        onClose={() => setDialogOpen(false)}
        onSubmit={() => setDialogOpen(false)}
      />
    </React.Fragment>
  );
};

interface menuProps {
  getFromListOnClick: () => NoxMedia.Playlist;
  onSubmit?: () => void;
  onCancel?: () => void;
}
export const CopiedPlaylistMenuItem = ({
  getFromListOnClick,
  onSubmit = () => undefined,
  onCancel = () => undefined,
}: menuProps) => {
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
