import React from 'react';
import { Button, Dialog, Portal } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import PortaledInput, {
  PortalInputRef,
} from '@components/dialogs/PortaledInput';

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
  onSubmit = () => undefined,
}: Props) => {
  const { t } = useTranslation();
  const inputRef = React.useRef<PortalInputRef>();

  const handleClose = () => {
    onClose();
  };
  const handleSubmit = () => {
    onSubmit(inputRef.current?.name || '');
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
          <Button onPress={handleClose}>{t('Dialog.cancel')}</Button>
          <Button onPress={handleSubmit}>{t('Dialog.ok')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
