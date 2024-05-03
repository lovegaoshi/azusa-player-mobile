import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View, TextInput } from 'react-native';
import { Text } from 'react-native-paper';

import GenericDialog from '@components/dialogs/GenericDialog';
import { useNoxSetting } from '@stores/useApp';
import { SettingListItem } from '../useRenderSetting';
import { replaceStyleColor } from '@components/style';

export default () => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setPlayerStyle = useNoxSetting(state => state.setPlayerStyle);
  const [visible, setVisible] = React.useState(false);
  const [primaryColor, setPrimaryColor] = React.useState('');
  const [secondaryColor, setSecondaryColor] = React.useState('');
  const [contrastColor, setContrastColor] = React.useState('');
  const [backgroundColor, setBackgroundColor] = React.useState('');

  React.useEffect(() => {
    if (!visible) return;
    setPrimaryColor(playerStyle.colors.primary);
    setSecondaryColor(playerStyle.colors.secondary);
    setContrastColor(playerStyle.customColors.playlistDrawerBackgroundColor);
    setBackgroundColor(playerStyle.colors.background);
  }, [visible]);

  const onSubmit = () => {
    setVisible(false);
    setPlayerStyle(
      replaceStyleColor({
        playerStyle,
        primaryColor,
        secondaryColor,
        contrastColor,
        backgroundColor,
        noWeeb: true,
      })
    );
  };

  return (
    <View>
      <GenericDialog
        visible={visible}
        onClose={() => setVisible(false)}
        onSubmit={onSubmit}
        title={t('AppearanceSettings.noWeebSkinsDesc')}
      >
        <ScrollView>
          <View style={styles.rowView}>
            <View
              style={[
                {
                  backgroundColor: primaryColor,
                },
                styles.colorBlock,
              ]}
            />
            <View style={styles.colorBlockSpace} />
            <Text>{t('AppearanceSettings.PrimaryColor')}</Text>
            <TextInput
              style={{ color: playerStyle.colors.primary }}
              value={primaryColor}
              onChangeText={setPrimaryColor}
            ></TextInput>
          </View>
          <View style={styles.rowView}>
            <View
              style={[
                {
                  backgroundColor: secondaryColor,
                },
                styles.colorBlock,
              ]}
            />
            <View style={styles.colorBlockSpace} />
            <Text>{t('AppearanceSettings.SecondaryColor')}</Text>
            <TextInput
              style={{ color: playerStyle.colors.primary }}
              value={secondaryColor}
              onChangeText={setSecondaryColor}
            ></TextInput>
          </View>
          <View style={styles.rowView}>
            <View
              style={[
                {
                  backgroundColor: contrastColor,
                },
                styles.colorBlock,
              ]}
            />
            <View style={styles.colorBlockSpace} />
            <Text>{t('AppearanceSettings.ContrastColor')}</Text>
            <TextInput
              style={{ color: playerStyle.colors.primary }}
              value={contrastColor}
              onChangeText={setContrastColor}
            ></TextInput>
          </View>
          <View style={styles.rowView}>
            <View
              style={[
                {
                  backgroundColor: backgroundColor,
                },
                styles.colorBlock,
              ]}
            />
            <View style={styles.colorBlockSpace} />
            <Text>{t('AppearanceSettings.BackgroundColor')}</Text>
            <TextInput
              style={{ color: playerStyle.colors.primary }}
              value={backgroundColor}
              onChangeText={setBackgroundColor}
            ></TextInput>
          </View>
        </ScrollView>
      </GenericDialog>
      <SettingListItem
        settingName="noWeebSkins"
        onPress={() => setVisible(true)}
        settingCategory="AppearanceSettings"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rowView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorBlock: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: 'white',
  },
  colorBlockSpace: {
    width: 10,
  },
});
