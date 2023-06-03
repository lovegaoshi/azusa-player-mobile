import React, { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNoxSetting } from '../../hooks/useSetting';

interface InputProps {
  defaultName: string;
  handleSubmit: () => void;
  label: string;
  autofocus?: boolean;
  selectTextOnFocus?: boolean;
}
export default React.forwardRef(
  (
    {
      defaultName,
      handleSubmit,
      label,
      autofocus = true,
      selectTextOnFocus = true,
    }: InputProps,
    ref
  ) => {
    const { t } = useTranslation();
    const [name, setName] = useState(defaultName);
    const playerStyle = useNoxSetting(state => state.playerStyle);
    React.useImperativeHandle(
      ref,
      () => ({ clearText: () => setName(''), name }),
      [name]
    );

    return (
      <TextInput
        label={String(t(label))}
        value={name}
        onChangeText={(val: string) => setName(val)}
        onSubmitEditing={handleSubmit}
        selectTextOnFocus={selectTextOnFocus}
        selectionColor={playerStyle.customColors.textInputSelectionColor}
        autoFocus={autofocus}
        textColor={playerStyle.colors.text}
      />
    );
  }
);
