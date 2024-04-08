import React, { useState } from 'react';
import { Menu, Checkbox, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import Dialog from '@components/dialogs/GenericSelectDialog';
import { SORT_OPTIONS } from '@enums/Playlist';
import { StyleSheet } from 'react-native-windows';
import { View } from 'react-native';

const ICON = 'sort';

interface Props {
  onCancel?: () => void;
  sortPlaylist: (
    sortOptions: SORT_OPTIONS,
    ascending: boolean,
    playlist: NoxMedia.Playlist
  ) => void;
  playlist: NoxMedia.Playlist;
}

export default ({
  onCancel = () => undefined,
  sortPlaylist,
  playlist,
}: Props) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ascending, setAscending] = useState(false);
  const sortOptions = Object.entries(SORT_OPTIONS);

  const handleClose = () => {
    setDialogOpen(false);
    onCancel();
  };

  const handleSubmit = (index: number) => {
    setDialogOpen(false);
    if (index === -1) return;
    sortPlaylist(sortOptions[index][1], ascending, playlist);
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
        title={t('PlaylistOperations.sortDialogTitle', { playlist })}
        renderOptionTitle={val => t(`PlaylistOperations.sort${val}`)}
        defaultIndex={sortOptions.findIndex(val => val[1] === playlist.sort)}
      >
        <View style={style.rowAlignedView}>
          <Checkbox
            status={ascending ? 'checked' : 'unchecked'}
            onPress={() => setAscending(v => !v)}
          />
          <Text variant="titleLarge" style={style.checkboxText}>
            {t('PlaylistOperations.ascending')}
          </Text>
        </View>
      </Dialog>
    </React.Fragment>
  );
};

const style = StyleSheet.create({
  rowAlignedView: {
    flexDirection: 'row',
  },
  checkboxText: {
    paddingTop: 3,
  },
});
