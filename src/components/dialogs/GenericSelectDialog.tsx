/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Pressable, View, FlatList, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text, RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

const DialogTitle = ({ title }: { title: string | undefined }) => {
  if (!title) return <View></View>;
  return (
    <Dialog.Title style={styles.dialogTitle}>
      {title.length > 20 ? title.substring(0, 20) + '...' : title}
    </Dialog.Title>
  );
};

interface Props<T> {
  visible: boolean;
  options: Array<T>;
  renderOptionTitle?: (val: T) => string;
  title?: string;
  defaultIndex?: number;
  onClose?: (index?: number) => void;
  onSubmit?: (index: number) => void;
  children?: React.ReactNode;
}

/**
 * a generic dialog that displays a list of items in radiobuttons.
 */
export default ({
  visible,
  options,
  renderOptionTitle = val => String(val),
  title = undefined,
  defaultIndex = 0,
  onClose = () => undefined,
  onSubmit = () => undefined,
  children,
}: Props<any>) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(defaultIndex);

  const handleClose = () => {
    onClose(currentIndex);
    setCurrentIndex(defaultIndex);
  };

  const handleSubmit = () => {
    if (options[currentIndex] === undefined) {
      handleClose();
      return;
    }
    onSubmit(currentIndex);
  };

  React.useEffect(() => setCurrentIndex(defaultIndex), [defaultIndex]);

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={handleClose}
        style={{
          minHeight: options.length > 5 ? '50%' : options.length * 55 + 110,
        }}
      >
        <DialogTitle title={title} />
        <Dialog.Content style={styles.dialogContent}>
          {children}
          <FlatList
            style={[styles.flatList]}
            data={options}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => setCurrentIndex(index)}
                style={styles.dialogItem}
                key={index}
              >
                <View style={styles.rowView} key={index}>
                  <RadioButton
                    value={item}
                    status={currentIndex === index ? 'checked' : 'unchecked'}
                    onPress={() => setCurrentIndex(index)}
                  />
                  <Text variant="titleLarge" style={styles.dialogText}>
                    {renderOptionTitle(item)}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </Dialog.Content>
        <Dialog.Actions
          style={[
            styles.dialogActions,
            { marginTop: options.length > 5 ? 0 : -100 },
          ]}
        >
          <Button onPress={handleClose}>{t('Dialog.cancel')}</Button>
          <Button onPress={handleSubmit}>{t('Dialog.ok')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialogTitle: {
    maxHeight: 100,
  },
  dialogContent: {
    flex: 1,
    minHeight: '20%',
  },
  dialogItem: {
    paddingVertical: 5,
  },
  dialogText: {
    paddingTop: 3,
  },
  flatList: {
    flex: 6,
  },
  dialogActions: {
    maxHeight: 60,
    paddingBottom: 0,
  },
  rowView: { flexDirection: 'row' },
});
