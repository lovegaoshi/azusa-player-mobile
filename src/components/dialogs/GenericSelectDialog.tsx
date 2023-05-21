import React, { useState } from 'react';
import { Pressable, View, FlatList } from 'react-native';
import { Button, Dialog, Portal, Text, RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
interface props<T> {
  visible: boolean;
  options: Array<T>;
  renderOptionTitle?: (val: T) => string;
  title?: string;
  defaultIndex?: number;
  onClose?: (index?: number) => void;
  onSubmit?: (index: number) => void;
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
  onClose = (index?: number) => void 0,
  onSubmit = (index: number) => void 0,
}: // whelp. i tried.
props<any>) => {
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

  const renderTitle = () => {
    if (!title) return <View></View>;
    return (
      <Dialog.Title style={{ maxHeight: 100 }}>
        {title.length > 20 ? title.substring(0, 20) + '...' : title}
      </Dialog.Title>
    );
  };

  React.useEffect(() => setCurrentIndex(defaultIndex), [defaultIndex]);

  return (
    <Dialog
      visible={visible}
      onDismiss={handleClose}
      style={{ maxHeight: '60%', minHeight: '50%' }}
    >
      {renderTitle()}
      <Dialog.Content style={{ flex: 1, minHeight: '20%' }}>
        <FlatList
          style={{ flex: 6 }}
          data={options}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => setCurrentIndex(index)}
              style={{ paddingVertical: 5 }}
              key={index}
            >
              <View style={{ flexDirection: 'row' }} key={index}>
                <RadioButton
                  value={item}
                  status={currentIndex === index ? 'checked' : 'unchecked'}
                  onPress={() => setCurrentIndex(index)}
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
  );
};
