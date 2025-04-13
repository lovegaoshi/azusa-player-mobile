import { FlatList, Pressable, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';

import NoxInput, { ManagedInput } from './NoxInput';
import GenericDialog from './GenericDialog';

interface Props {
  label: string;
  text: string;
  setText: (text: string) => void;
}

export default ({ text, setText, label }: Props) => {
  const [splitText, setSplitText] = useState<string[]>([]);
  const splitTextRef = useRef(splitText);
  const [dialogVisible, setDialogVisible] = useState(false);

  const addEntry = () => {
    splitTextRef.current = ['', ...splitTextRef.current];
    setSplitText(splitTextRef.current);
  };

  const removeEntry = (index: number) => {
    splitTextRef.current.splice(index, 1);
    setSplitText(splitTextRef.current);
  };

  const updateText = (text: string, index: number) => {
    splitTextRef.current[index] = text;
    console.log(splitText);
  };

  useEffect(() => {
    const splitMyText = text.split(';');
    setSplitText(splitMyText);
    splitTextRef.current = splitMyText;
  }, [text]);

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
        onClose={() => setDialogVisible(val => !val)}
        onSubmit={() => {
          console.log(splitText);
          setText(splitText.join(';'));
          setDialogVisible(val => !val);
        }}
      >
        <FlatList
          data={splitText}
          renderItem={({ index }) => (
            <View>
              <ManagedInput
                text={splitTextRef.current[index]}
                setText={t => updateText(t, index)}
                autofocus={false}
                selectTextOnFocus={false}
              />
            </View>
          )}
        />
      </GenericDialog>
    </View>
  );
};
