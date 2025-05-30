import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PaperText as Text } from '@components/commonui/ScaledText';
import { useNoxSetting } from '@stores/useApp';
const DummySettings = () => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <View
      style={[
        styles.dummySettingsContainer,
        { backgroundColor: playerStyle.customColors.maskedBackgroundColor },
      ]}
    >
      <Text
        style={[
          styles.dummySettingsText,
          { color: playerStyle.colors.primary },
        ]}
      >
        {t('Settings.FeatureNotImplemented')}
      </Text>
    </View>
  );
};

export default DummySettings;

const styles = StyleSheet.create({
  dummySettingsContainer: {
    flex: 1,
  },
  dummySettingsText: {
    fontSize: 60,
    paddingLeft: 20,
  },
});
