import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import GeneralSettings from './GeneralSettings';
import AppearanceSettings from './appearances/View';
import AListSettings from './alist/View';
import DeveloperSettings from './developer/View';
import SyncSettings from './SyncSettings';
import { useNoxSetting } from '@stores/useApp';
import SettingListItem from './helpers/SettingListItem';
import LanguageSettings from './LanguageSettings';
import AboutSettings from './AboutSettings';
import SplashSettings from './SplashSettings';
import DownloadSettings from './DownloadSettings';
import LoginSettings from '../login/View';
import PremiumSettings from '../billing/View';
import { isAndroid, isIOS } from '@utils/RNUtils';

enum NoxView {
  HOME = 'cog',
  SKIN = 'palette',
  BACKUP = 'backup-restore',
  INFO = 'information',
  DEVELOPER = 'application-brackets',
  LANGUAGE = 'translate',
  LOGIN = 'login-variant',
  SPLASH_GALLARY = 'view-gallery',
  ALIST = 'google-cloud',
  DOWNLOAD = 'file-download',
  PREMIUM = 'cash',

  DUMMY = 'Features not implemented',
  GENERAL = 'General',
}

const Stack = createNativeStackNavigator();

interface Props extends NoxComponent.StackNavigationProps {
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
          icon={NoxView.HOME}
          settingName="GeneralSetting"
          onPress={() => navigation.navigate(NoxView.GENERAL)}
          settingCategory="Settings"
        />
        <SettingListItem
          icon={NoxView.SKIN}
          settingName="AppearanceSetting"
          onPress={() => navigation.navigate(NoxView.SKIN)}
          settingCategory="Settings"
        />
        <SettingListItem
          icon={NoxView.LOGIN}
          settingName="Login"
          onPress={() => navigation.navigate(NoxView.LOGIN)}
          settingCategory="Settings"
        />
        <SettingListItem
          icon={NoxView.BACKUP}
          settingName="BackupSetting"
          onPress={() => navigation.navigate(NoxView.BACKUP)}
          settingCategory="Settings"
        />
        <LanguageSettings icon={NoxView.LANGUAGE} />
        <SettingListItem
          icon={NoxView.ALIST}
          settingName="AListOptions"
          onPress={() => navigation.navigate(NoxView.ALIST)}
          settingCategory="Settings"
        />
        {isAndroid && isIOS && (
          <SettingListItem
            icon={NoxView.DOWNLOAD}
            settingName="DownloadOptions"
            onPress={() => navigation.navigate(NoxView.DOWNLOAD)}
            settingCategory="Settings"
          />
        )}
        <SettingListItem
          icon={NoxView.DEVELOPER}
          settingName="DeveloperOptions"
          onPress={() => navigation.navigate(NoxView.DEVELOPER)}
          settingCategory="Settings"
        />
        <SettingListItem
          icon={NoxView.PREMIUM}
          settingName="PremiumSetting"
          onPress={() => navigation.navigate(NoxView.PREMIUM)}
          settingCategory="Settings"
        />
        <SettingListItem
          icon={NoxView.SPLASH_GALLARY}
          settingName="SplashSetting"
          onPress={() => navigation.navigate(NoxView.SPLASH_GALLARY)}
          settingCategory="Settings"
        />
        <SettingListItem
          icon={NoxView.INFO}
          settingName="InfoSetting"
          onPress={() => navigation.navigate(NoxView.INFO)}
          settingCategory="Settings"
        />
      </ScrollView>
    </View>
  );
};

const Settings = ({ headerBackVisible = true }: Props) => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator screenOptions={{ headerBackVisible }}>
      <Stack.Screen
        name={NoxView.HOME}
        component={HomeSettings}
        options={{ title: t('Settings.HomeSettingName') }}
      />
      <Stack.Screen
        name={NoxView.SPLASH_GALLARY}
        component={SplashSettings}
        options={{ title: t('Settings.SplashSettingName') }}
      />
      <Stack.Screen
        name={NoxView.INFO}
        component={AboutSettings}
        options={{ title: t('Settings.InfoSettingName') }}
      />
      <Stack.Screen
        name={NoxView.GENERAL}
        component={GeneralSettings}
        options={{ title: t('Settings.GeneralSettingName') }}
      />
      <Stack.Screen
        name={NoxView.SKIN}
        component={AppearanceSettings}
        options={{ title: t('Settings.AppearanceSettingName') }}
      />
      <Stack.Screen
        name={NoxView.DEVELOPER}
        component={DeveloperSettings}
        options={{ title: t('Settings.DeveloperOptionsName') }}
      />
      <Stack.Screen
        name={NoxView.ALIST}
        component={AListSettings}
        options={{ title: t('Settings.AListOptionsName') }}
      />
      {isAndroid && (
        <Stack.Screen
          name={NoxView.DOWNLOAD}
          component={DownloadSettings}
          options={{ title: t('Settings.DownloadOptionsName') }}
        />
      )}
      <Stack.Screen
        name={NoxView.BACKUP}
        component={SyncSettings}
        options={{ title: t('Settings.BackupSettingName') }}
      />
      <Stack.Screen
        name={NoxView.LOGIN}
        component={LoginSettings}
        options={{ title: t('appDrawer.LoginName') }}
      />
      <Stack.Screen
        name={NoxView.PREMIUM}
        component={PremiumSettings}
        options={{ title: t('appDrawer.PremiumName') }}
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
