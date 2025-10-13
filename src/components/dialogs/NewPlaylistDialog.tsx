import React from 'react';
import { Button, Dialog, Portal } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { dummyPlaylist } from '@objects/Playlist';
import usePlaylistBrowseTree from '@hooks/usePlaylistBrowseTree';
import NoxInput from './NoxInput';

interface Props {
  visible: boolean;
  fromList?: NoxMedia.Playlist;
  onClose?: () => void;
  onSubmit?: () => void;
}

const NewPlaylistDialog = ({
  visible,
  fromList,
  onClose = () => undefined,
  onSubmit = () => undefined,
}: Props) => {
  const { t } = useTranslation();
  const [text, setText] = React.useState('');
  const { addPlaylist } = usePlaylistBrowseTree();

  const handleClose = () => {
    setText('');
    onClose();
  };

  const handleSubmit = () => {
    setText('');
    const dummyList = dummyPlaylist();
    const newList = fromList
      ? {
          ...fromList,
          id: dummyList.id,
          title: text,
          type: dummyList.type,
        }
      : { ...dummyList, title: text };
    addPlaylist(newList);
    onSubmit();
  };

  return (
    <Dialog visible={visible} onDismiss={handleClose} style={styles.dialog}>
      <Dialog.Title>
        {fromList
          ? t('NewPlaylistDialog.title', { fromList })
          : t('NewPlaylistDialog.titleNew')}
      </Dialog.Title>
      <Dialog.Content>
        <NoxInput
          handleSubmit={handleSubmit}
          label={t('NewPlaylistDialog.label')}
          selectTextOnFocus={false}
          text={text}
          setText={setText}
        />
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={handleClose}>{t('Dialog.cancel')}</Button>
        <Button onPress={handleSubmit}>{t('Dialog.ok')}</Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default function NewPlaylistDialogPortal(p: Props) {
  return (
    <Portal>
      <NewPlaylistDialog {...p} />
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
  },
});
