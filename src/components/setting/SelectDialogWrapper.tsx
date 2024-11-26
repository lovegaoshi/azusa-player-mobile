import * as React from 'react';
import { View, ViewStyle } from 'react-native';

import GenericSelectDialog from '../dialogs/GenericSelectDialog';
import { SelectSettingEntry } from './helpers/SettingEntry';

export interface SelectDialogChildren<T> {
  setCurrentSelectOption: React.Dispatch<
    React.SetStateAction<SelectSettingEntry<T> | undefined>
  >;
  setSelectVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Props<T> {
  viewStyle?: ViewStyle;
  Children: (p: SelectDialogChildren<T>) => React.JSX.Element;
}
export default function SelectDialog<T>({ Children, viewStyle }: Props<T>) {
  const [currentSelectOption, setCurrentSelectOption] =
    React.useState<SelectSettingEntry<T>>();
  const [selectVisible, setSelectVisible] = React.useState(false);

  return (
    <View style={viewStyle}>
      <Children
        setCurrentSelectOption={setCurrentSelectOption}
        setSelectVisible={setSelectVisible}
      />
      <GenericSelectDialog
        visible={selectVisible}
        options={currentSelectOption?.options}
        renderOptionTitle={currentSelectOption?.renderOption}
        title={currentSelectOption?.title}
        defaultIndex={currentSelectOption?.defaultIndex}
        onClose={currentSelectOption?.onClose}
        onSubmit={currentSelectOption?.onSubmit}
      />
    </View>
  );
}
