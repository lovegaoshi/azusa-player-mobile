import * as React from 'react';
import { View, ScrollView } from 'react-native';
import { IconButton, List } from 'react-native-paper';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { useNoxSetting } from '../../hooks/useSetting';
import { logStore, LOGLEVEL } from '../../utils/Logger';
import GenericSelectDialog from '../dialogs/GenericSelectDialog';

interface SelectSettingEntry<T> {
  options: Array<T>;
  renderOption: (option: T) => string;
  defaultIndex: number;
  onClose: (index?: number) => void;
  onSubmit: (index: number) => void;
}

const dummySelectSettingEntry: SelectSettingEntry<string> = {
  options: [],
  renderOption: () => '',
  defaultIndex: 0,
  onClose: () => void 0,
  onSubmit: () => void 0,
};

interface SettingEntry {
  name: string;
  desc: string;
  settingName: string;
  reRender?: boolean;
  settingType?: string;
}

const { getState, setState } = logStore;

export default () => {
  const { t } = useTranslation();
  const [currentSelectOption, setCurrentSelectOption] = React.useState<
    SelectSettingEntry<any>
  >(dummySelectSettingEntry);
  const [selectVisible, setSelectVisible] = React.useState(false);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);

  const selectLogLevel = () => {
    setSelectVisible(true);
    setCurrentSelectOption({
      options: [
        LOGLEVEL.DEBUG,
        LOGLEVEL.INFO,
        LOGLEVEL.WARN,
        LOGLEVEL.ERROR,
        LOGLEVEL.CRITICAL,
        LOGLEVEL.NONE,
      ],
      renderOption: (option: number) =>
        [
          t('DeveloperSettings.LogLevel0'),
          t('DeveloperSettings.LogLevel1'),
          t('DeveloperSettings.LogLevel2'),
          t('DeveloperSettings.LogLevel3'),
          t('DeveloperSettings.LogLevel4'),
          t('DeveloperSettings.LogLevel5'),
        ][option],
      defaultIndex: getState().logLevel,
      onClose: () => setSelectVisible(false),
      onSubmit: (index: number) => {
        setState({ logLevel: index });
        setSelectVisible(false);
      },
    } as SelectSettingEntry<number>);
  };

  return (
    <View
      style={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        flex: 1,
      }}
    >
      <ScrollView>
        <List.Section>
          <List.Item
            left={props => <IconButton icon={'console'} size={40} />}
            title={String(t('DeveloperSettings.LogLevelName'))}
            description={t('DeveloperSettings.LogLevelDesc')}
            onPress={selectLogLevel}
            titleStyle={{ color: playerStyle.colors.primary }}
            descriptionStyle={{ color: playerStyle.colors.secondary }}
          />
        </List.Section>
      </ScrollView>
      <GenericSelectDialog
        visible={selectVisible}
        options={currentSelectOption.options}
        renderOptionTitle={currentSelectOption.renderOption}
        defaultIndex={currentSelectOption.defaultIndex}
        onClose={currentSelectOption.onClose}
        onSubmit={currentSelectOption.onSubmit}
      ></GenericSelectDialog>
    </View>
  );
};
