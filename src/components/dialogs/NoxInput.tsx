import React from 'react';

import { TextInput } from 'react-native-paper';
import { TextStyle, TextInput as RNTextInput } from 'react-native';

import { useNoxSetting } from '@stores/useApp';

interface InputProps {
  handleSubmit?: () => void;
  label?: string;
  autofocus?: boolean;
  selectTextOnFocus?: boolean;
  text: string;
  setText: (text: string) => void;
  secureTextEntry?: boolean;
  style?: TextStyle;
  reactNative?: boolean;
  numberOfLines?: number;
}

export default ({
  handleSubmit,
  label,
  autofocus = true,
  selectTextOnFocus = true,
  text,
  setText,
  secureTextEntry,
  style,
  reactNative = false,
  numberOfLines = 1,
}: InputProps) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const Input = reactNative ? RNTextInput : TextInput;

  return (
    <Input
      style={style}
      value={text}
      onChangeText={(val: string) => setText(val)}
      label={label}
      onSubmitEditing={handleSubmit}
      selectTextOnFocus={selectTextOnFocus}
      selectionColor={playerStyle.customColors.textInputSelectionColor}
      autoFocus={autofocus}
      textColor={playerStyle.colors.onSurfaceVariant}
      secureTextEntry={secureTextEntry}
      numberOfLines={numberOfLines}
    />
  );
};
