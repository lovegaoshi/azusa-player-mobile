import React from 'react';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  children?: React.ReactNode;
  onClose?: () => void;
  onSubmit?: () => void;
  title?: string;
}

export default ({
  visible,
  children = <Text variant="bodyMedium">This is simple dialog</Text>,
  onClose = () => undefined,
  onSubmit = () => undefined,
  title,
}: Props) => {
  const { t } = useTranslation();
  const handleClose = () => {
    onClose();
  };
  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose}>
        {title && <Dialog.Title>{title}</Dialog.Title>}
        <Dialog.Content>{children}</Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleClose}>{t('Dialog.cancel')}</Button>
          <Button onPress={handleSubmit}>{t('Dialog.ok')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
