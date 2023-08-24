import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { DrawerNavigationProp } from '@react-navigation/drawer';

import SkinSettings from './SkinSettings';
import { SettingListItem, RenderSetting } from '../useRenderSetting';
import { useNoxSetting } from '@hooks/useSetting';

interface Props {
  navigation: DrawerNavigationProp<ParamListBase>;
}

enum VIEW {
  HOME = 'AppearanceHome',
  SKIN = 'SkinSetting',
}
const Stack = createNativeStackNavigator();

const MainView = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const navigationGlobal = useNavigation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  return (
    <View
      style={[
        styles.homeSettingsContainer,
        { backgroundColor: playerStyle.customColors.maskedBackgroundColor },
      ]}
    >
      <ScrollView>
        <SettingListItem
          icon={'palette-swatch-variant'}
          settingName="SkinSetting"
          onPress={() => navigation.navigate(VIEW.SKIN)}
          settingCategory="Settings"
        />
        <RenderSetting
          item={{
            settingName: 'trackCoverArtCard',
            settingCategory: 'GeneralSettings',
          }}
        />
      </ScrollView>
    </View>
  );
};

const AppearanceSetting = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={VIEW.HOME}
        component={MainView}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={VIEW.SKIN}
        component={SkinSettings}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
export default AppearanceSetting;

const styles = StyleSheet.create({
  dummySettingsContainer: {
    flex: 1,
  },
  dummySettingsText: {
    fontSize: 60,
    paddingLeft: 20,
  },
  homeSettingsContainer: {
    flex: 1,
  },
  menuButton: {
    width: 55,
    marginLeft: -5,
  },
});
