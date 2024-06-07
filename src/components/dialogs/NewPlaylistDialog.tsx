import React, { useRef } from 'react';
import { Button, Dialog, Portal } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { dummyPlaylist } from '@objects/Playlist';
import usePlaylistBrowseTree from '@hooks/usePlaylistBrowseTree';
import PortaledInput, { PortalInputRef } from './PortaledInput';

interface Props {
  visible: boolean;
  fromList?: NoxMedia.Playlist;
  onClose?: () => void;
  onSubmit?: () => void;
}

export default ({
  visible,
  fromList,
  onClose = () => undefined,
  onSubmit = () => undefined,
}: Props) => {
  const { t } = useTranslation();
  const { addPlaylist } = usePlaylistBrowseTree();
  const inputRef = useRef<PortalInputRef>();

  const handleClose = () => {
    inputRef?.current?.clearText();
    onClose();
  };

  const handleSubmit = () => {
    inputRef?.current?.clearText();
    const dummyList = dummyPlaylist();
    const newList = fromList
      ? {
        ...fromList,
        id: dummyList.id,
        title: inputRef.current?.name ?? '',
        type: dummyList.type,
      }
      : { ...dummyList, title: inputRef.current?.name ?? '' };
    addPlaylist(newList);
    onSubmit();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose} style={styles.dialog}>
        <Dialog.Title>
          {fromList
            ? t('NewPlaylistDialog.title', { fromList })
            : t('NewPlaylistDialog.titleNew')}
        </Dialog.Title>
        <Dialog.Content>
          <PortaledInput
            handleSubmit={handleSubmit}
            ref={inputRef}
            label={'NewPlaylistDialog.label'}
            defaultName={''}
            selectTextOnFocus={false}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleClose}>{t('Dialog.cancel')}</Button>
          <Button onPress={handleSubmit}>{t('Dialog.ok')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
  },
});
