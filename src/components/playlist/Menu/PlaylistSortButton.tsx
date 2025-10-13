import React, { useState } from 'react';
import { Checkbox } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet } from 'react-native';

import Dialog from '@components/dialogs/GenericSelectDialog';
import { SortOptions } from '@enums/Playlist';
import SheetIconEntry from '@components/commonui/bottomsheet/SheetIconEntry';
import { PaperText as Text } from '@components/commonui/ScaledText';

const ICON = 'sort';

interface Props {
  onCancel?: () => void;
  sortPlaylist: (
    sortOptions: SortOptions,
    ascending: boolean,
    playlist: NoxMedia.Playlist,
  ) => void;
  playlist: NoxMedia.Playlist;
  showSheet?: (v: boolean) => void;
}

export default function PlaylistSortButton({
  onCancel = () => undefined,
  sortPlaylist,
  playlist,
  showSheet,
}: Props) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ascending, setAscending] = useState(false);
  const sortOptions = Object.entries(SortOptions);

  const handleClose = () => {
    setDialogOpen(false);
    onCancel();
    showSheet?.(true);
  };

  const handleSubmit = (index: number) => {
    setDialogOpen(false);
    if (index === -1) return;
    sortPlaylist(sortOptions[index][1], ascending, playlist);
  };

  return (
    <SheetIconEntry
      text={t('PlaylistOperations.sortDiagTitle')}
      icon={ICON}
      onPress={() => {
        setDialogOpen(true);
        showSheet?.(false);
      }}
    >
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
    </SheetIconEntry>
  );
}

const style = StyleSheet.create({
  rowAlignedView: {
    flexDirection: 'row',
  },
  checkboxText: {
    paddingTop: 3,
  },
});
