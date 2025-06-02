import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Portal } from 'react-native-paper';
import { Image } from 'expo-image';

import { PaperText as Text } from '@components/commonui/ScaledText';
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
            style={styles.image}
            source={{
              uri: 'https://i2.hdslb.com/bfs/archive/7d83d7c95b11df26a700f445788877ef279c4b80.jpg@600w_600h_1c.png',
              ...styles.image,
            }}
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
            style={[styles.marginTop, { color: playerStyle.colors.onSurface }]}
            autofocus={false}
            selectTextOnFocus={false}
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
            style={[styles.marginTop, { color: playerStyle.colors.onSurface }]}
            autofocus={false}
            selectTextOnFocus={false}
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
            style={[styles.marginTop, { color: playerStyle.colors.onSurface }]}
            autofocus={false}
            selectTextOnFocus={false}
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
            style={[styles.marginTop, { color: playerStyle.colors.onSurface }]}
            autofocus={false}
            selectTextOnFocus={false}
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
  marginTop: { marginTop: 1 },
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
  image: { width: 60, height: 60 },
});

export default (p: Props) => {
  return (
    <Portal>
      <NoWeebDialog {...p} />
    </Portal>
  );
};
