import { View, ScrollView, Linking } from 'react-native';
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
        <Text
          style={{
            fontSize: 20,
            color: playerStyle.colors.primary,
            paddingHorizontal: 20,
          }}
        >
          {t('About.Disclaimer1')}
        </Text>
        <Text>{''}</Text>
        <Text
          style={{
            fontSize: 20,
            color: playerStyle.colors.primary,
            paddingHorizontal: 20,
          }}
        >
          {t('About.Disclaimer2')}
        </Text>
        <Text>{''}</Text>
        <Text
          style={{
            fontSize: 20,
            color: playerStyle.colors.primary,
            paddingHorizontal: 20,
          }}
        >
          {t('About.About1')}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Button
            onPress={() =>
              Linking.openURL(
                'https://github.com/lovegaoshi/azusa-player-mobile/releases/latest'
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
