import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Dialog, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { FlashList } from '@shopify/flash-list';

import { logger } from '@utils/Logger';

interface Props {
  visible: boolean;
  options: string[];
  title?: string;
  onClose?: (input: { [key: string]: string }) => void;
  onSubmit?: (input: { [key: string]: string }) => void;
}

const DialogTitle = ({ title }: { title: string | undefined }) => {
  if (!title) return <View></View>;
  return (
    <Dialog.Title style={styles.dialogTitle}>
      {title.length > 20 ? title.substring(0, 20) + '...' : title}
    </Dialog.Title>
  );
};
/**
 * a generic dialog that displays a list of items in inputs
 */
export default ({
  visible,
  options,
  title = undefined,
  onClose = logger.debug,
  onSubmit = logger.debug,
}: Props) => {
  const { t } = useTranslation();
  const [currentInput, setCurrentInput] = useState<{
    [key: string]: string;
  }>({});
  const [dialogHeight, setDialogHeight] = useState(0);

  const handleClose = () => {
    onClose(currentInput);
  };

  const handleSubmit = () => {
    onSubmit(currentInput);
  };

  React.useEffect(
    () =>
      setCurrentInput(
        options.reduce((acc, curr) => ({ ...acc, [curr]: '' }), {}),
      ),
    [options],
  );

  return (
    <Dialog visible={visible} onDismiss={handleClose}>
      <DialogTitle title={title} />
      <Dialog.Content
        style={{
          minHeight:
            options.length > 4
              ? '50%'
              : dialogHeight > 0
                ? dialogHeight
                : options.length * 40 + 40,
        }}
      >
        <FlashList
          onContentSizeChange={(w, h) => setDialogHeight(h + 40)}
          style={styles.flatList}
          data={options}
          renderItem={({ item }) => (
            <TextInput
              label={item}
              value={currentInput[item]}
              onChange={e =>
                setCurrentInput({ ...currentInput, [item]: e.nativeEvent.text })
              }
            />
          )}
        />
      </Dialog.Content>
      <Dialog.Actions style={styles.dialogActions}>
        <Button onPress={handleClose}>{t('Dialog.cancel')}</Button>
        <Button onPress={handleSubmit}>{t('Dialog.ok')}</Button>
      </Dialog.Actions>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  dialogTitle: { maxHeight: 100 },
  flatList: { flex: 1 },
  dialogActions: { paddingBottom: 0 },
});
