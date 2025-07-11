import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet } from 'react-native';
import { Switch, TouchableRipple, Checkbox } from 'react-native-paper';

import { NativeText as Text } from '@components/commonui/ScaledText';
import { useNoxSetting } from '@stores/useApp';
import { SettingEntry } from './SettingEntry';

const BooleanSetting = ({
  settingName,
  settingCategory,
  reRender = false,
  checkbox = false,
  callback,
}: SettingEntry) => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
  const [loaded, setLoaded] = React.useState(false);

  const togglePlaylistReRender = useNoxSetting(
    state => state.togglePlaylistShouldReRender,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveSettings = (toggled: { [key: string]: any }) =>
    setPlayerSetting(toggled);

  const onToggle = () => {
    saveSettings({ [settingName]: !playerSetting[settingName] }).then(callback);
    if (reRender) {
      togglePlaylistReRender();
    }
  };

  React.useEffect(() => {
    setTimeout(() => setLoaded(true), 1);
  }, []);

  return (
    <TouchableRipple onPress={onToggle} style={styles.touchableRipple}>
      <View style={styles.settingContainer}>
        <View style={styles.settingTextContainer}>
          <Text
            style={[
              styles.settingText,
              { color: playerStyle.colors.onSurface },
            ]}
          >
            {t(`${settingCategory}.${settingName}Name`)}
          </Text>
          <Text
            style={[
              styles.settingDescription,
              { color: playerStyle.colors.onSurfaceVariant },
            ]}
          >
            {t(`${settingCategory}.${settingName}Desc`)}
          </Text>
        </View>
        <View style={styles.switchContainer}>
          {loaded &&
            (checkbox ? (
              <Checkbox
                status={playerSetting[settingName] ? 'checked' : 'unchecked'}
                onPress={onToggle}
              />
            ) : (
              <Switch
                value={playerSetting[settingName]}
                onValueChange={onToggle}
              />
            ))}
        </View>
      </View>
    </TouchableRipple>
  );
};

export default BooleanSetting;

const styles = StyleSheet.create({
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
