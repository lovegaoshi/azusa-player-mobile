import { useTranslation } from 'react-i18next';
import { View, Text } from 'react-native';
import {
  IconButton,
  List,
  Switch,
  TouchableRipple,
  Checkbox,
} from 'react-native-paper';
import { v4 as uuidv4 } from 'uuid';
import { useNoxSetting } from '../../hooks/useSetting';

export interface SettingEntry {
  settingName: string;
  settingCategory: string;
  reRender?: boolean;
  settingType?: string;
  checkbox?: boolean;
}

export default () => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);

  const togglePlaylistReRender = useNoxSetting(
    state => state.togglePlaylistShouldReRender
  );

  const saveSettings = (toggled: { [key: string]: any }) => {
    setPlayerSetting(toggled);
  };

  /**
   * renders a generic clickable item.
   * @param icon icon string.
   * @param settingName subcategory in i18n.
   * @param onPress callback on pressed
   * @param settingCategory category in i18n.
   * @returns
   */
  const renderListItem = (
    icon: string,
    settingName: string,
    onPress: () => void,
    settingCategory = 'DeveloperSettings'
  ) => {
    return (
      <List.Item
        left={props => <IconButton icon={icon} size={40} />}
        title={String(t(`${settingCategory}.${settingName}Name`))}
        description={t(`${settingCategory}.${settingName}Desc`)}
        onPress={onPress}
        titleStyle={{ color: playerStyle.colors.primary }}
        descriptionStyle={{ color: playerStyle.colors.secondary }}
      />
    );
  };

  const renderSetting = (item: SettingEntry) => {
    switch (item.settingType) {
      default:
        return booleanSetting(item);
    }
  };

  const booleanSetting = ({
    settingName,
    settingCategory,
    reRender = false,
    checkbox = false,
  }: SettingEntry) => {
    const onToggle = () => {
      saveSettings({ [settingName]: !playerSetting[settingName] });
      if (reRender) {
        togglePlaylistReRender();
      }
    };

    return (
      <TouchableRipple
        onPress={onToggle}
        style={{ paddingHorizontal: 10 }}
        key={uuidv4()}
      >
        <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
          <View style={{ flex: 5, paddingLeft: 5 }}>
            <Text style={{ fontSize: 20, color: playerStyle.colors.primary }}>
              {t(`${settingCategory}.${settingName}Name`)}
            </Text>
            <Text style={{ fontSize: 15, color: playerStyle.colors.secondary }}>
              {t(`${settingCategory}.${settingName}Desc`)}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              paddingTop: 10,
              alignItems: 'flex-end',
            }}
          >
            {checkbox ? (
              <Checkbox
                status={playerSetting[settingName] ? 'checked' : 'unchecked'}
                onPress={onToggle}
              />
            ) : (
              <Switch
                value={playerSetting[settingName]}
                onValueChange={onToggle}
                color={playerStyle.colors.onSurfaceVariant}
              />
            )}
          </View>
        </View>
      </TouchableRipple>
    );
  };

  return { renderListItem, renderSetting };
};
