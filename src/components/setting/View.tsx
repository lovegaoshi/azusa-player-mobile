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
import { useNoxSetting } from '../../hooks/useSetting';
import { ViewEnum } from '../../enums/View';

enum ICONS {
  HOME = 'cog',
  // TODO: need to figure out the skin object story first before implementing this
  SKIN = 'palette',
  // TODO: need to figure out bili SESSIONDATA first before implementing this.
  // though a good time to think about oauth2 now
  BACKUP = 'backup-restore',
  INFO = 'information',
  DEVELOPER = 'application-brackets',
}

enum VIEW {
  HOME = 'Settings',
  DUMMY = 'Features not implemented',
  GENERAL = 'General',
  SKIN = 'Skins',
  DEVELOPER = 'Developer Options',
}

const Stack = createNativeStackNavigator();

interface props {
  navigation: DrawerNavigationProp<ParamListBase>;
}

export default ({ navigation }: props) => {
  const { t } = useTranslation();
  const navigationGlobal = useNavigation();
  const playerStyle = useNoxSetting(state => state.playerStyle);

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
          <List.Item
            left={props => <IconButton icon={ICONS.HOME} size={40} />}
            title={String(t('Settings.GeneralSettingTitle'))}
            description={String(t('Settings.GeneralSettingDesc'))}
            onPress={() => navigation.navigate(VIEW.GENERAL)}
            style={{}}
            titleStyle={{ color: playerStyle.colors.primary }}
            descriptionStyle={{ color: playerStyle.colors.secondary }}
          />
          <List.Item
            left={props => <IconButton icon={ICONS.SKIN} size={40} />}
            title={String(t('Settings.SkinSettingTitle'))}
            description={String(t('Settings.SkinSettingDesc'))}
            onPress={() => navigation.navigate(VIEW.SKIN)}
            style={{}}
            titleStyle={{ color: playerStyle.colors.primary }}
            descriptionStyle={{ color: playerStyle.colors.secondary }}
          />
          <List.Item
            left={props => <IconButton icon={ICONS.BACKUP} size={40} />}
            title={String(t('Settings.BackupSettingTitle'))}
            description={String(t('Settings.BackupSettingDesc'))}
            onPress={() => navigation.navigate(VIEW.DUMMY)}
            style={{}}
            titleStyle={{ color: playerStyle.colors.primary }}
            descriptionStyle={{ color: playerStyle.colors.secondary }}
          />
          <List.Item
            left={props => <IconButton icon={ICONS.DEVELOPER} size={40} />}
            title={String(t('Settings.DeveloperOptionsTitle'))}
            description={String(t('Settings.DeveloperOptionsDesc'))}
            onPress={() => navigation.navigate(VIEW.DEVELOPER)}
            style={{}}
            titleStyle={{ color: playerStyle.colors.primary }}
            descriptionStyle={{ color: playerStyle.colors.secondary }}
          />
          <List.Item
            left={props => <IconButton icon={ICONS.INFO} size={40} />}
            title={String(t('Settings.InfoSettingTitle'))}
            description={String(t('Settings.InfoSettingDesc'))}
            onPress={() => navigation.navigate(VIEW.DUMMY)}
            style={{}}
            titleStyle={{ color: playerStyle.colors.primary }}
            descriptionStyle={{ color: playerStyle.colors.secondary }}
          />
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
        options={{ title: String(t('Settings.GeneralSettingTitle')) }}
      />
      <Stack.Screen
        name={VIEW.SKIN}
        component={SkinSettings}
        options={{ title: String(t('Settings.SkinSettingTitle')) }}
      />
      <Stack.Screen
        name={VIEW.DEVELOPER}
        component={DeveloperSettings}
        options={{ title: String(t('Settings.DeveloperOptionsTitle')) }}
      />
    </Stack.Navigator>
  );
};
