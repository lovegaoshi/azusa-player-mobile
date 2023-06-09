import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { View } from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { List, MD3Colors, IconButton, Text } from 'react-native-paper';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ScrollView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '../../hooks/useSetting';

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
        <Text>{}</Text>
        <Text
          style={{
            fontSize: 20,
            color: playerStyle.colors.primary,
            paddingHorizontal: 20,
          }}
        >
          {t('About.Disclaimer1')}
        </Text>
        <Text>{}</Text>
        <Text
          style={{
            fontSize: 20,
            color: playerStyle.colors.primary,
            paddingHorizontal: 20,
          }}
        >
          {t('About.Disclaimer2')}
        </Text>
        <Text>{}</Text>
        <Text
          style={{
            fontSize: 20,
            color: playerStyle.colors.primary,
            paddingHorizontal: 20,
          }}
        >
          {t('About.About1')}
        </Text>
      </ScrollView>
    </View>
  );
};
