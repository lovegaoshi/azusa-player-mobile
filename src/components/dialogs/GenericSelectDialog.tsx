import React, { useState } from 'react';
import { Pressable, View, FlatList } from 'react-native';
import { Button, Dialog, Portal, Text, RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

import { styles } from '../style';

const dialogTitleStyle = { maxHeight: 100 };
const dialogStyle = { maxHeight: '60%', minHeight: '50%', zIndex: 100000 };
const dialogContentStyle = { flex: 1, minHeight: '20%' };
const dialogItemStyle = { paddingVertical: 5 };
const dialogTextStyle = { paddingTop: 3 };
const flatListStyle = { flex: 6 };
const dialogActionsStyle = { maxHeight: 60, paddingBottom: 0 };

const DialogTitle = ({ title }: { title: string | undefined }) => {
  if (!title) return <View></View>;
  return (
    <Dialog.Title style={dialogTitleStyle}>
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
  onClose = (index?: number) => undefined,
  onSubmit = (index: number) => undefined,
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
      <Dialog visible={visible} onDismiss={handleClose} style={dialogStyle}>
        <DialogTitle title={title} />
        <Dialog.Content style={dialogContentStyle}>
          <FlatList
            style={flatListStyle}
            data={options}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => setCurrentIndex(index)}
                style={dialogItemStyle}
                key={index}
              >
                <View style={styles.rowView} key={index}>
                  <RadioButton
                    value={item}
                    status={currentIndex === index ? 'checked' : 'unchecked'}
                    onPress={() => setCurrentIndex(index)}
                  />
                  <Text variant="titleLarge" style={dialogTextStyle}>
                    {renderOptionTitle(item)}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </Dialog.Content>
        <Dialog.Actions style={dialogActionsStyle}>
          <Button onPress={handleClose}>{t('Dialog.cancel')}</Button>
          <Button onPress={handleSubmit}>{t('Dialog.ok')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};