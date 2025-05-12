/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Pressable, View, FlatList, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text, RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { execWhenTrue } from '@utils/Utils';

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
  options?: T[];
  renderOptionTitle?: (val: T) => string;
  title?: string;
  defaultIndex?: number;
  onClose?: (index?: number) => void;
  onSubmit?: (index: number) => void;
  children?: React.ReactNode;
  onPress?: (index: number) => void;
}

/**
 * a generic dialog that displays a list of items in radiobuttons.
 */
export default function GenericSelectDialog<T>({
  visible,
  options = [],
  renderOptionTitle = val => String(val),
  title = undefined,
  defaultIndex = 0,
  onClose = () => undefined,
  onSubmit = () => undefined,
  onPress = () => undefined,
  children,
}: Props<T>) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(defaultIndex);
  const listRef = React.useRef<FlatList<T>>(null);

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

  const onItemPress = (index: number) => {
    setCurrentIndex(index);
    onPress(index);
  };

  React.useEffect(() => setCurrentIndex(defaultIndex), [defaultIndex]);

  React.useEffect(() => {
    if (!visible || defaultIndex < 0) return;
    /// HACK: initScrollIndex isnt working if flatlist is not init
    // with initScrollIndex or without execWhenTrue will yield a rte
    execWhenTrue({
      loopCheck: async () => listRef?.current !== null,
      executeFn: () =>
        setTimeout(() => {
          listRef.current?.scrollToIndex({
            index: defaultIndex,
            animated: false,
          });
        }, 1),
    });
  }, [visible]);

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
            ref={listRef}
            style={[styles.flatList]}
            data={options}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => onItemPress(index)}
                style={styles.dialogItem}
                key={index}
              >
                <View style={styles.rowView} key={index}>
                  <RadioButton
                    value={String(item)}
                    status={currentIndex === index ? 'checked' : 'unchecked'}
                    onPress={() => onItemPress(index)}
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
}

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
