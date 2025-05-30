import React from 'react';
import { Button, Dialog, Portal } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { PaperText as Text } from '@components/commonui/ScaledText';

interface Props {
  visible: boolean;
  children?: React.ReactNode;
  onClose?: () => void;
  onSubmit?: () => void;
  title?: string;
  ExtraButtons?: () => JSX.Element;
}

export const GenericDialog = ({
  visible,
  children = <Text variant="bodyMedium">This is simple dialog</Text>,
  onClose = () => undefined,
  onSubmit = () => undefined,
  title,
  ExtraButtons = () => <></>,
}: Props) => {
  const { t } = useTranslation();
  const handleClose = () => {
    onClose();
  };
  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <Dialog visible={visible} onDismiss={handleClose}>
      {title && <Dialog.Title>{title}</Dialog.Title>}
      <Dialog.Content style={styles.dialogContent}>{children}</Dialog.Content>
      <Dialog.Actions>
        <ExtraButtons />
        <Button onPress={handleClose}>{t('Dialog.cancel')}</Button>
        <Button onPress={handleSubmit}>{t('Dialog.ok')}</Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default (p: Props) => {
  return (
    <Portal>
      <GenericDialog {...p} />
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialogContent: {
    maxHeight: '80%',
  },
});
