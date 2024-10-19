import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Portal, Text } from 'react-native-paper';
import { Image } from 'expo-image';

import { GenericDialog } from '@components/dialogs/GenericDialog';
import { useNoxSetting } from '@stores/useApp';
import { replaceStyleColor } from '@components/style';
import NoxInput from '@components/dialogs/NoxInput';

interface Props {
  visible: boolean;
  setVisible: (value: boolean) => void;
}

const NoWeebDialog = ({ visible, setVisible }: Props) => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setPlayerStyle = useNoxSetting(state => state.setPlayerStyle);
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
      }),
    );
  };

  return (
    <GenericDialog
      visible={visible}
      onClose={() => setVisible(false)}
      onSubmit={onSubmit}
      title={t('AppearanceSettings.noWeebSkinsDesc')}
    >
      <ScrollView>
        <View style={{ alignItems: 'center' }}>
          <Image
            style={{ width: 60, height: 60 }}
            source={
              'https://i2.hdslb.com/bfs/archive/7d83d7c95b11df26a700f445788877ef279c4b80.jpg@600w_600h_1c.png'
            }
          />
        </View>
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
          <NoxInput
            autofocus={false}
            selectTextOnFocus={false}
            style={{ color: playerStyle.colors.primary }}
            text={primaryColor}
            setText={setPrimaryColor}
            reactNative={true}
          />
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
          <NoxInput
            autofocus={false}
            selectTextOnFocus={false}
            style={{ color: playerStyle.colors.primary }}
            text={secondaryColor}
            setText={setSecondaryColor}
            reactNative={true}
          />
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
          <NoxInput
            autofocus={false}
            selectTextOnFocus={false}
            style={{ color: playerStyle.colors.primary }}
            text={contrastColor}
            setText={setContrastColor}
            reactNative={true}
          />
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
          <NoxInput
            autofocus={false}
            selectTextOnFocus={false}
            style={{ color: playerStyle.colors.primary }}
            text={backgroundColor}
            setText={setBackgroundColor}
            reactNative={true}
          />
        </View>
      </ScrollView>
    </GenericDialog>
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

export default (p: Props) => {
  return (
    <Portal>
      <NoWeebDialog {...p} />
    </Portal>
  );
};
