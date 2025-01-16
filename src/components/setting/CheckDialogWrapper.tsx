import * as React from 'react';
import { View } from 'react-native';

import Dialog from '../dialogs/GenericCheckDialog';
import { CheckSettingEntry } from './helpers/SettingEntry';
import { styles } from '@components/style';
import { SelectDialogChildren } from './SelectDialogWrapper';

export interface CheckDialogChildren<T> {
  setCurrentCheckOption: React.Dispatch<
    React.SetStateAction<CheckSettingEntry<T> | undefined>
  >;
  setCheckVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface SelectCheckChildren<T>
  extends CheckDialogChildren<T>,
    SelectDialogChildren<T> {}

interface Props<T> {
  Children: (p: CheckDialogChildren<T>) => React.JSX.Element;
}
export default function CheckDialog<T>({ Children }: Props<T>) {
  const [currentCheckOption, setCurrentCheckOption] =
    React.useState<CheckSettingEntry<T>>();
  const [CheckVisible, setCheckVisible] = React.useState(false);

  return (
    <View style={styles.flex}>
      <Children
        setCurrentCheckOption={setCurrentCheckOption}
        setCheckVisible={setCheckVisible}
      />
      <Dialog
        visible={CheckVisible}
        options={currentCheckOption?.options}
        renderOptionTitle={currentCheckOption?.renderOption}
        title={currentCheckOption?.title}
        onClose={currentCheckOption?.onClose}
        onSubmit={currentCheckOption?.onSubmit}
      />
    </View>
  );
}

interface SelectCheckProps<T> extends SelectDialogChildren<T> {
  Children: (p: SelectCheckChildren<T>) => React.JSX.Element;
}
export function SelectCheckDialog<T>(p: SelectCheckProps<T>) {
  const { Children } = p;
  const [currentCheckOption, setCurrentCheckOption] =
    React.useState<CheckSettingEntry<T>>();
  const [CheckVisible, setCheckVisible] = React.useState(false);

  return (
    <View style={styles.flex}>
      <Children
        {...p}
        setCurrentCheckOption={setCurrentCheckOption}
        setCheckVisible={setCheckVisible}
      />
      <Dialog
        visible={CheckVisible}
        options={currentCheckOption?.options}
        renderOptionTitle={currentCheckOption?.renderOption}
        title={currentCheckOption?.title}
        onClose={currentCheckOption?.onClose}
        onSubmit={currentCheckOption?.onSubmit}
      />
    </View>
  );
}
