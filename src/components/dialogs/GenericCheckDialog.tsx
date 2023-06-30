import React, { useState } from 'react';
import { Pressable, View, FlatList } from 'react-native';
import { Button, Dialog, Portal, Text, Checkbox } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

const dialogTitleStyle = { maxHeight: 100 };
const dialogStyle = { maxHeight: '60%', minHeight: '50%', zIndex: 100000 };
const dialogContentStyle = { flex: 1, minHeight: '20%' };
const flatListStyle = { flex: 6 };
const pressableStyle = { paddingVertical: 5 };
const viewStyle = { flexDirection: 'row' as "row" };
const checkboxStyle = { paddingTop: 3 };
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
      <Dialog visible={visible} onDismiss={handleClose} style={dialogStyle}>
        <DialogTitle title={title} />
        <Dialog.Content style={dialogContentStyle}>
          <FlatList
            style={flatListStyle}
            data={options}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => toggleIndex(index)}
                style={pressableStyle}
                key={index}
              >
                <View style={viewStyle} key={index}>
                  <Checkbox
                    status={currentIndex[index] ? 'checked' : 'unchecked'}
                    onPress={() => toggleIndex(index)}
                  />
                  <Text variant="titleLarge" style={checkboxStyle}>
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