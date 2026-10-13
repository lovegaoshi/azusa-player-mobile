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
  ExtraButtons?: () => React.JSX.Element;
  PortalWrapper?: (p: {
    children: React.JSX.Element;
    visible?: boolean;
  }) => React.JSX.Element;
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

export default function GenericDialogPortal(p: Props) {
  const PortalWrapper = p.PortalWrapper ?? Portal;
  return (
    <PortalWrapper visible={p.visible}>
      <GenericDialog {...p} />
    </PortalWrapper>
  );
}

const styles = StyleSheet.create({
  dialogContent: {
    maxHeight: '80%',
  },
});
