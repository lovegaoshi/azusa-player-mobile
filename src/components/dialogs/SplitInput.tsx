import { FlatList, Pressable, View } from 'react-native';
import { useEffect, useState } from 'react';
import { Button, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import Animated, { LinearTransition } from 'react-native-reanimated';

import NoxInput, { ManagedInput } from './NoxInput';
import GenericDialog from './GenericDialog';

interface Props {
  label: string;
  text: string;
  setText: (text: string) => void;
}

export default ({ text, setText, label }: Props) => {
  const { t } = useTranslation();
  const [splitText, setSplitText] = useState<string[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);

  const addEntry = () => {
    const newSplitExt = ['', ...splitText];
    setSplitText(newSplitExt);
  };

  const removeEntry = (index: number) => {
    const newSplitExt = splitText.toSpliced(index, 1);
    setSplitText(newSplitExt);
  };

  const updateText = (text: string, index: number) => {
    splitText[index] = text;
  };

  const initText = () => setSplitText(text.split(';'));

  useEffect(() => {
    initText();
  }, [text]);

  const AddEntryButton = () => (
    <Button onPress={addEntry}>{t('Dialog.addEntry')}</Button>
  );

  return (
    <View>
      <Pressable onPress={() => setDialogVisible(true)}>
        <NoxInput
          label={label}
          autofocus={false}
          selectTextOnFocus={false}
          text={text}
          setText={setText}
          enable={false}
        />
      </Pressable>
      <GenericDialog
        visible={dialogVisible}
        title={label}
        onClose={() => {
          setDialogVisible(val => !val);
          initText();
        }}
        onSubmit={() => {
          setText(splitText.filter(v => v.length > 0).join(';'));
          setDialogVisible(val => !val);
        }}
        ExtraButtons={AddEntryButton}
      >
        <Animated.FlatList
          itemLayoutAnimation={LinearTransition}
          data={splitText}
          renderItem={({ index }) => (
            <View style={{ flexDirection: 'row' }}>
              <ManagedInput
                style={{ flex: 1 }}
                text={splitText[index]}
                setText={t => updateText(t, index)}
                autofocus={false}
                extraData={splitText.length}
              />
              <IconButton
                icon="trash-can"
                onPress={() => removeEntry(index)}
                size={40}
              />
            </View>
          )}
        />
      </GenericDialog>
    </View>
  );
};
