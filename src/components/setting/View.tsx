import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { View } from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { List, MD3Colors, IconButton, Text } from 'react-native-paper';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';

import GeneralSettings from './GeneralSettings';
import SkinSettings from './SkinSettings';
import DeveloperSettings from './DeveloperSettings';
import SyncSettings from './SyncSettings';
import { useNoxSetting } from '../../hooks/useSetting';
import useRenderSettingItem from './useRenderSetting';
import LanguageSettings from './LanguageSettings';

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
}

enum VIEW {
  HOME = 'Settings',
  DUMMY = 'Features not implemented',
  GENERAL = 'General',
  SKIN = 'Skins',
  DEVELOPER = 'Developer Options',
  BACKUP = 'Sync',
}

const Stack = createNativeStackNavigator();

interface props {
  navigation: DrawerNavigationProp<ParamListBase>;
}

export default ({ navigation }: props) => {
  const { t } = useTranslation();
  const navigationGlobal = useNavigation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const { renderListItem } = useRenderSettingItem();

  const DummySettings = () => {
    return (
      <View
        style={{
          backgroundColor: playerStyle.customColors.maskedBackgroundColor,
          flex: 1,
        }}
      >
        <Text
          style={{
            fontSize: 60,
            color: playerStyle.colors.primary,
            paddingLeft: 20,
          }}
        >
          {t('Settings.FeatureNotImplemented')}
        </Text>
      </View>
    );
  };

  const HomeSettings = ({ navigation }: props) => {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        }}
      >
        <List.Section>
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
            ICONS.INFO,
            'InfoSetting',
            () => navigation.navigate(VIEW.DUMMY),
            'Settings'
          )}
        </List.Section>
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
              style={{ width: 55, marginLeft: -5 }}
              onPress={() => navigation.openDrawer()}
            />
          ),
        }}
      />
      <Stack.Screen
        name={VIEW.DUMMY}
        component={DummySettings}
        options={{ title: String(t('Settings.FeatureNotImplemented')) }}
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
    </Stack.Navigator>
  );
};
