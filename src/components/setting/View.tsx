import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet, ScrollView } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import GeneralSettings from './GeneralSettings';
import AppearanceSettings from './appearances/View';
import DeveloperSettings from './DeveloperSettings';
import SyncSettings from './SyncSettings';
import { useNoxSetting } from '@stores/useApp';
import { SettingListItem } from './useRenderSetting';
import LanguageSettings from './LanguageSettings';
import AboutSettings from './AboutSettings';
import SplashSettings from './SplashSettings';
import Bilibili from '../login/Bilibili';

enum Icons {
  HOME = 'cog',
  SKIN = 'palette',
  BACKUP = 'backup-restore',
  INFO = 'information',
  DEVELOPER = 'application-brackets',
  LANGUAGE = 'translate',
  LOGIN = 'login-variant',
  SPLASH_GALLARY = 'view-gallery',
}

enum VIEW {
  HOME = 'Settings',
  DUMMY = 'Features not implemented',
  GENERAL = 'General',
  SKIN = 'Skins',
  DEVELOPER = 'Developer Options',
  BACKUP = 'Sync',
  LOGIN = 'Login',
  INFO = 'About',
  SPLASH_GALLARY = 'Splash Gallary',
}

const Stack = createNativeStackNavigator();

interface Props extends NoxComponent.NavigationProps {
  headerBackVisible?: boolean;
}

const HomeSettings = ({ navigation }: Props) => {
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
          icon={Icons.HOME}
          settingName="GeneralSetting"
          onPress={() => navigation.navigate(VIEW.GENERAL)}
          settingCategory="Settings"
        />
        <SettingListItem
          icon={Icons.SKIN}
          settingName="AppearanceSetting"
          onPress={() => navigation.navigate(VIEW.SKIN)}
          settingCategory="Settings"
        />
        <SettingListItem
          icon={Icons.LOGIN}
          settingName="Login"
          onPress={() => navigation.navigate(VIEW.LOGIN)}
          settingCategory="Settings"
        />
        <SettingListItem
          icon={Icons.BACKUP}
          settingName="BackupSetting"
          onPress={() => navigation.navigate(VIEW.BACKUP)}
          settingCategory="Settings"
        />
        <LanguageSettings icon={Icons.LANGUAGE} />
        <SettingListItem
          icon={Icons.DEVELOPER}
          settingName="DeveloperOptions"
          onPress={() => navigation.navigate(VIEW.DEVELOPER)}
          settingCategory="Settings"
        />
        <SettingListItem
          icon={Icons.SPLASH_GALLARY}
          settingName="SplashSetting"
          onPress={() => navigation.navigate(VIEW.SPLASH_GALLARY)}
          settingCategory="Settings"
        />
        <SettingListItem
          icon={Icons.INFO}
          settingName="InfoSetting"
          onPress={() => navigation.navigate(VIEW.INFO)}
          settingCategory="Settings"
        />
      </ScrollView>
    </View>
  );
};

const Settings = ({ navigation, headerBackVisible = true }: Props) => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator screenOptions={{ headerBackVisible }}>
      <Stack.Screen
        name={VIEW.HOME}
        component={HomeSettings}
      />
      <Stack.Screen
        name={VIEW.SPLASH_GALLARY}
        component={SplashSettings}
        options={{ title: String(t('Settings.SplashSettingName')) }}
      />
      <Stack.Screen
        name={VIEW.INFO}
        component={AboutSettings}
        options={{ title: String(t('Settings.InfoSettingName')) }}
      />
      <Stack.Screen
        name={VIEW.GENERAL}
        component={GeneralSettings}
        options={{ title: String(t('Settings.GeneralSettingName')) }}
      />
      <Stack.Screen
        name={VIEW.SKIN}
        component={AppearanceSettings}
        options={{ title: String(t('Settings.AppearanceSettingName')) }}
      />
      <Stack.Screen
        name={VIEW.DEVELOPER}
        component={DeveloperSettings}
        options={{ title: String(t('Settings.DeveloperOptionsName')) }}
      />
      <Stack.Screen
        name={VIEW.BACKUP}
        component={SyncSettings}
        options={{ title: String(t('Settings.BackupSettingName')) }}
      />
      <Stack.Screen
        name={VIEW.LOGIN}
        component={Bilibili}
        options={{ title: String(t('appDrawer.LoginName')) }}
      />
    </Stack.Navigator>
  );
};

export const SettingsLandscape = ({
  navigation,
  headerBackVisible = false,
}: Props) => Settings({ navigation, headerBackVisible });

export default Settings;

const styles = StyleSheet.create({
  homeSettingsContainer: {
    flex: 1,
  },
  menuButton: {
    width: 55,
    marginLeft: -5,
  },
});
