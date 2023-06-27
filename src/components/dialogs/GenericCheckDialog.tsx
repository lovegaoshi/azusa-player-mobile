import React, { useState } from 'react';
import { Pressable, View, FlatList } from 'react-native';
import { Button, Dialog, Portal, Text, Checkbox } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

const DialogTitle = ({ title }: { title: string | undefined }) => {
  if (!title) return <View></View>;
  return (
    <Dialog.Title style={{ maxHeight: 100 }}>
      {title.length > 20 ? title.substring(0, 20) + '...' : title}
    </Dialog.Title>
  );
};

interface Props<T> {
  visible: boolean;
  options: Array<T>;
  renderOptionTitle?: (val: T) => string;
  title?: string;
  onClose?: (index?: boolean[]) => void;
  onSubmit?: (index: boolean[]) => void;
}

/**
 * a generic dialog that displays a list of items in radiobuttons.
 */
export default ({
  visible,
  options,
  renderOptionTitle = val => String(val),
  title = undefined,
  onClose = (index?: boolean[]) => undefined,
  onSubmit = (index: boolean[]) => undefined,
}: Props<any>) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState<boolean[]>([]);

  const handleClose = () => {
    onClose(currentIndex);
  };

  const handleSubmit = () => {
    onSubmit(currentIndex);
  };

  const toggleIndex = (index: number) => {
    setCurrentIndex(currentIndex.map((val, i) => (i === index ? !val : val)));
  };

  React.useEffect(
    () => setCurrentIndex(Array(options.length).fill(false)),
    [options]
  );

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={handleClose}
        style={{ maxHeight: '60%', minHeight: '50%', zIndex: 100000 }}
      >
        <DialogTitle title={title} />
        <Dialog.Content style={{ flex: 1, minHeight: '20%' }}>
          <FlatList
            style={{ flex: 6 }}
            data={options}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => toggleIndex(index)}
                style={{ paddingVertical: 5 }}
                key={index}
              >
                <View style={{ flexDirection: 'row' }} key={index}>
                  <Checkbox
                    status={currentIndex[index] ? 'checked' : 'unchecked'}
                    onPress={() => toggleIndex(index)}
                  />
                  <Text variant="titleLarge" style={{ paddingTop: 3 }}>
                    {renderOptionTitle(item)}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </Dialog.Content>
        <Dialog.Actions style={{ maxHeight: 60, paddingBottom: 0 }}>
          <Button onPress={handleClose}>{t('Dialog.cancel')}</Button>
          <Button onPress={handleSubmit}>{t('Dialog.ok')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
