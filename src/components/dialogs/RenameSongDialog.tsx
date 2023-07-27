import React, { useState } from 'react';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNoxSetting } from '@hooks/useSetting';
import PortaledInput from './PortaledInput';

interface Props {
  visible: boolean;
  song: NoxMedia.Song;
  onClose?: () => void;
  onSubmit?: (rename: string) => void;
}

export default ({
  visible,
  song,
  onClose = () => undefined,
  onSubmit = (rename: string) => undefined,
}: Props) => {
  const { t } = useTranslation();
  const inputRef = React.useRef<any>();

  const handleClose = () => {
    onClose();
  };
  const handleSubmit = () => {
    onSubmit(inputRef.current.name);
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose}>
        <Dialog.Title>{t('RenameSongDialog.title', { song })}</Dialog.Title>
        <Dialog.Content>
          <PortaledInput
            handleSubmit={handleSubmit}
            ref={inputRef}
            label={'RenameSongDialog.label'}
            defaultName={song.name}
          />
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={handleClose}>Cancel</Button>
          <Button onPress={handleSubmit}>Done</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
