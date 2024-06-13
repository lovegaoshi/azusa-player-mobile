import React from 'react';
import { TextInput } from 'react-native-paper';
import { useNoxSetting } from '@stores/useApp';
import { RenderProps } from 'react-native-paper/lib/typescript/components/TextInput/types';

interface InputProps {
  handleSubmit?: () => void;
  label: string;
  autofocus?: boolean;
  selectTextOnFocus?: boolean;
  text: string;
  setText: (text: string) => void;
  render?: (p: RenderProps) => React.ReactNode;
}

export default ({
  handleSubmit,
  label,
  autofocus = true,
  selectTextOnFocus = true,
  text,
  setText,
  render,
}: InputProps) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <TextInput
      render={render}
      label={label}
      value={text}
      onChangeText={(val: string) => setText(val)}
      onSubmitEditing={handleSubmit}
      selectTextOnFocus={selectTextOnFocus}
      selectionColor={playerStyle.customColors.textInputSelectionColor}
      autoFocus={autofocus}
      textColor={playerStyle.colors.text}
    />
  );
};
