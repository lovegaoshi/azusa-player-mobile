import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Dialog from '../dialogs/CopiedPlaylistDialog';
import { dummyPlaylistList } from '@objects/Playlist';
import SheetIconButton, {
  Props,
} from '../commonui/bottomsheet/SheetIconButton';

const ICON = 'playlist-plus';

interface MenuProps {
  getFromListOnClick: () => NoxMedia.Playlist;
  onSubmit?: () => void;
  onCancel?: () => void;
  showSheet?: (v: boolean) => void;
  Button?: (p: Props) => React.ReactNode;
}
export default function CopiedPlaylistButton({
  getFromListOnClick,
  onSubmit = () => undefined,
  onCancel = () => undefined,
  showSheet,
  Button = SheetIconButton,
}: MenuProps) {
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
    <Button
      icon={ICON}
      onPress={() => {
        setDialogOpen(true);
        setFromList(getFromListOnClick());
        showSheet?.(false);
      }}
      text={t('PlaylistOperations.playlistSendToTitle')}
    >
      <Dialog
        visible={dialogOpen}
        fromList={fromList}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </Button>
  );
}
