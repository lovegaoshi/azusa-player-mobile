import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Dialog, Portal, Provider, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

interface props {
  visible: boolean;
  onClose?: () => void;
  onSubmit?: () => void;
}

export default ({
  visible,
  onClose = () => void 0,
  onSubmit = () => void 0,
}: props) => {
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
        <Dialog.Title>Alert</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">This is simple dialog</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleClose}>{t('Dialog.cancel')}</Button>
          <Button onPress={handleSubmit}>{t('Dialog.ok')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
