import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';
import {
  IconButton,
  List,
  Switch,
  TouchableRipple,
  Checkbox,
} from 'react-native-paper';
import { v4 as uuidv4 } from 'uuid';

import { useNoxSetting } from '@hooks/useSetting';
import { SettingEntry } from './SetttingEntries';

/**
 * renders a generic clickable item.
 * @param icon icon string.
 * @param settingName subcategory in i18n.
 * @param onPress callback on pressed
 * @param settingCategory category in i18n.
 * @returns
 */
interface SetttingListInterface {
  icon?: string | (() => JSX.Element);
  settingName: string;
  onPress: () => void;
  settingCategory?: string;
  modifyDescription?: (val: string) => string;
}

export const SettingListItem = ({
  icon,
  settingName,
  onPress,
  settingCategory = 'DeveloperSettings',
  modifyDescription = (val: string) => val,
}: SetttingListInterface) => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);

  const getIcon = () => {
    if (typeof icon === 'string') {
      return <IconButton icon={icon} size={40} />;
    } else if (typeof icon === 'function') {
      return icon();
    } else {
      return <></>;
    }
  };

  return (
    <List.Item
      left={getIcon}
      title={String(t(`${settingCategory}.${settingName}Name`))}
      description={modifyDescription(
        t(`${settingCategory}.${settingName}Desc`)
      )}
      onPress={onPress}
      titleStyle={{ color: playerStyle.colors.primary }}
      descriptionStyle={{ color: playerStyle.colors.secondary }}
      style={styles.listItem}
    />
  );
};

const BooleanSetting = ({
  settingName,
  settingCategory,
  reRender = false,
  checkbox = false,
}: SettingEntry) => {
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

  const onToggle = () => {
    saveSettings({ [settingName]: !playerSetting[settingName] });
    if (reRender) {
      togglePlaylistReRender();
    }
  };

  return (
    <TouchableRipple onPress={onToggle} style={styles.touchableRipple}>
      <View style={styles.settingContainer}>
        <View style={styles.settingTextContainer}>
          <Text
            style={[styles.settingText, { color: playerStyle.colors.primary }]}
          >
            {t(`${settingCategory}.${settingName}Name`)}
          </Text>
          <Text
            style={[
              styles.settingDescription,
              { color: playerStyle.colors.secondary },
            ]}
          >
            {t(`${settingCategory}.${settingName}Desc`)}
          </Text>
        </View>
        <View style={styles.switchContainer}>
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

interface Props {
  item: SettingEntry;
}

export const RenderSetting = ({ item }: Props) => {
  switch (item.settingType) {
    default:
      return <BooleanSetting {...item} key={uuidv4()} />;
  }
};

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 0,
  },
  touchableRipple: {
    paddingHorizontal: 10,
  },
  settingContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  settingTextContainer: {
    flex: 5,
    paddingLeft: 5,
  },
  settingText: {
    fontSize: 20,
  },
  settingDescription: {
    fontSize: 15,
  },
  switchContainer: {
    flex: 1,
    paddingTop: 10,
    alignItems: 'flex-end',
  },
});
