import React, { useState } from 'react';
import { Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import Dialog from '@components/dialogs/GenericSelectDialog';
import { SORT_OPTIONS } from '@enums/Playlist';

const ICON = 'sort';

interface Props {
  onCancel?: () => void;
  sortPlaylist: (sortOptions: SORT_OPTIONS) => void;
}

export default ({ onCancel = () => undefined, sortPlaylist }: Props) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const sortOptions = Object.entries(SORT_OPTIONS);

  const handleClose = () => {
    setDialogOpen(false);
    onCancel();
  };

  const handleSubmit = (index: number) => {
    setDialogOpen(false);
    sortPlaylist(sortOptions[index][1]);
  };

  return (
    <React.Fragment>
      <Menu.Item
        leadingIcon={ICON}
        onPress={() => {
          setDialogOpen(true);
        }}
        title={t('PlaylistOperations.sortTitle')}
      />
      <Dialog
        options={sortOptions.map(val => val[0])}
        visible={dialogOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        title={t('PlaylistOperations.sortTitle')}
        renderOptionTitle={val => t(`PlaylistOperations.sort${val}`)}
      />
    </React.Fragment>
  );
};
