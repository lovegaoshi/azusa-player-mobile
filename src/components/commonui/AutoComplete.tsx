import { View, GestureResponderEvent } from 'react-native';
import { Menu, Searchbar } from 'react-native-paper';
import React, { useState } from 'react';
import { useDebounce } from 'use-debounce';

import { useNoxSetting } from '@stores/useApp';

interface Props {
  placeholder: string;
  value: string;
  setValue: (v: string) => void;
  onSubmit: (v: string) => void;
  style: any;
  onIconPress: (e: GestureResponderEvent) => void;
  icon: () => React.ReactNode;
}

export default ({
  placeholder,
  value,
  setValue,
  onSubmit,
  style,
  onIconPress,
  icon,
}: Props) => {
  const [debouncedValue] = useDebounce(value, 500);
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <Searchbar
      placeholder={placeholder}
      value={value}
      onChangeText={setValue}
      onSubmitEditing={() => onSubmit(value)}
      selectTextOnFocus
      style={style}
      selectionColor={playerStyle.customColors.textInputSelectionColor}
      onIconPress={onIconPress}
      icon={icon}
    />
  );
};
