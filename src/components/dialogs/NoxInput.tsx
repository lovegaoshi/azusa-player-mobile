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
  style?: TextStyle | TextStyle[];
  reactNative?: boolean;
  numberOfLines?: number;
  enable?: boolean;
  extraData?: unknown;
}

export const ManagedInput = ({
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
  enable = true,
  extraData,
}: InputProps) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const Input = reactNative ? RNTextInput : TextInput;
  const [mText, setMText] = React.useState(text);

  React.useEffect(() => {
    setMText(text);
  }, [text, extraData]);

  return (
    <Input
      editable={enable}
      style={style}
      value={mText}
      onChangeText={(val: string) => {
        setText(val);
        setMText(val);
      }}
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
  enable = true,
}: InputProps) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const Input = reactNative ? RNTextInput : TextInput;

  return (
    <Input
      editable={enable}
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
