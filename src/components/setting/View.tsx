import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { List, MD3Colors, IconButton } from 'react-native-paper';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ScrollView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';

import GeneralSettings from './GeneralSettings';
import SkinSettings from './SkinSettings';
import DeveloperSettings from './DeveloperSettings';
import SyncSettings from './SyncSettings';
import { useNoxSetting } from '../../hooks/useSetting';
import useRenderSettingItem from './useRenderSetting';
import LanguageSettings from './LanguageSettings';
import AboutSettings from './AboutSettings';
import SplashSettings from './SplashSettings';
import Bilibili from '../login/Bilibili';

enum ICONS {
  HOME = 'cog',
  // TODO: need to figure out the skin object story first before implementing this
  SKIN = 'palette',
  // TODO: need to figure out bili SESSIONDATA first before implementing this.
  // though a good time to think about oauth2 now
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

interface Props {
  navigation: DrawerNavigationProp<ParamListBase>;
}

export const DummySettings = () => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting((state) => state.playerStyle);

  return (
    <View style={[styles.dummySettingsContainer, { backgroundColor: playerStyle.customColors.maskedBackgroundColor }]}>
      <Text style={[styles.dummySettingsText, { color: playerStyle.colors.primary }]}>
        {t('Settings.FeatureNotImplemented')}
      </Text>
    </View>
  );
};

export default ({ navigation }: Props) => {
  const { t } = useTranslation();
  const navigationGlobal = useNavigation();
  const playerStyle = useNoxSetting((state) => state.playerStyle);
  const { renderListItem } = useRenderSettingItem();

  const HomeSettings = ({ navigation }: Props) => {
    return (
      <View style={[styles.homeSettingsContainer, { backgroundColor: playerStyle.customColors.maskedBackgroundColor }]}>
        <ScrollView>
          {renderListItem(
            ICONS.HOME,
            'GeneralSetting',
            () => navigation.navigate(VIEW.GENERAL),
            'Settings'
          )}
          {renderListItem(
            ICONS.SKIN,
            'SkinSetting',
            () => navigation.navigate(VIEW.SKIN),
            'Settings'
          )}
          {renderListItem(
            ICONS.LOGIN,
            'Login',
            () => navigation.navigate(VIEW.LOGIN),
            'Settings'
          )}
          {renderListItem(
            ICONS.BACKUP,
            'BackupSetting',
            () => navigation.navigate(VIEW.BACKUP),
            'Settings'
          )}
          <LanguageSettings icon={ICONS.LANGUAGE} />
          {renderListItem(
            ICONS.DEVELOPER,
            'DeveloperOptions',
            () => navigation.navigate(VIEW.DEVELOPER),
            'Settings'
          )}
          {renderListItem(
            ICONS.SPLASH_GALLARY,
            'SplashSetting',
            () => navigation.navigate(VIEW.SPLASH_GALLARY),
            'Settings'
          )}
          {renderListItem(
            ICONS.INFO,
            'InfoSetting',
            () => navigation.navigate(VIEW.INFO),
            'Settings'
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <Stack.Navigator screenOptions={{ headerBackVisible: true }}>
      <Stack.Screen
        name={VIEW.HOME}
        component={HomeSettings}
        options={{
          headerLeft: () => (
            <IconButton
              icon="menu"
              size={40}
              style={styles.menuButton}
              onPress={() => navigation.openDrawer()}
            />
          ),
        }}
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
        component={SkinSettings}
        options={{ title: String(t('Settings.SkinSettingName')) }}
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
