import { View, ScrollView, Linking, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';

export default () => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <View
      style={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        flex: 1,
      }}
    >
      <ScrollView>
        <Text>{''}</Text>
        <Text style={styles.text}>{t('About.Disclaimer1')}</Text>
        <Text>{''}</Text>
        <Text style={styles.text}>{t('About.Disclaimer2')}</Text>
        <Text>{''}</Text>
        <Text style={styles.text}>{t('About.About1')}</Text>
        <View style={styles.centeredRowContainer}>
          <Button
            onPress={() =>
              Linking.openURL(
                'https://github.com/lovegaoshi/azusa-player-mobile/releases/latest',
              )
            }
          >
            {'Gayhub'}
          </Button>
          <Button
            onPress={() =>
              Linking.openURL('https://space.bilibili.com/3493085134719196')
            }
          >
            {'Bilibili'}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    paddingHorizontal: 20,
  },
  centeredRowContainer: { flexDirection: 'row', justifyContent: 'center' },
});
