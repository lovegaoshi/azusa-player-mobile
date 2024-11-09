import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View, ScrollView } from 'react-native';

import SkinSettings from './SkinSettings';
import { SettingListItem, RenderSetting } from '../useRenderSetting';
import { useNoxSetting } from '@stores/useApp';
import SelectDarkModeButton from './SelectDarkModeButton';
import NoWeebButton from './NoWeebButton';
import SelectPhotoButton from './SelectPhotoButton';

enum VIEW {
  HOME = 'AppearanceHome',
  SKIN = 'SkinSetting',
}

const Stack = createNativeStackNavigator();

const MainView = ({ navigation }: NoxComponent.StackNavigationProps) => {
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
          onPress={() => navigation.popTo(VIEW.SKIN)}
          settingCategory="Settings"
        />
        <RenderSetting
          item={{
            settingName: 'hideCoverInMobile',
            settingCategory: 'AppearanceSettings',
          }}
        />
        <RenderSetting
          item={{
            settingName: 'trackCoverArtCard',
            settingCategory: 'AppearanceSettings',
          }}
        />
        <RenderSetting
          item={{
            settingName: 'wavyProgressBar',
            settingCategory: 'AppearanceSettings',
          }}
        />
        <RenderSetting
          item={{
            settingName: 'accentColor',
            settingCategory: 'AppearanceSettings',
          }}
        />
        <SelectDarkModeButton />
        <NoWeebButton />
        <SelectPhotoButton />
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
