import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { View } from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { List, MD3Colors, IconButton, Text } from 'react-native-paper';
import { DrawerNavigationProp } from '@react-navigation/drawer';

import GeneralSettings from './GeneralSettings';
import SkinSettings from './SkinSettings';
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
}

enum VIEW {
  HOME = 'Settings',
  DUMMY = 'Features not implemented',
  GENERAL = 'General',
  SKIN = 'Skins',
}

const Stack = createNativeStackNavigator();

interface props {
  navigation: DrawerNavigationProp<ParamListBase>;
}

export default ({ navigation }: props) => {
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
          Feature not implemented
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
            title="General Settings"
            description="General settings for the app."
            onPress={() => navigation.navigate(VIEW.GENERAL)}
            style={{}}
            titleStyle={{ color: playerStyle.colors.primary }}
            descriptionStyle={{ color: playerStyle.colors.secondary }}
          />
          <List.Item
            left={props => <IconButton icon={ICONS.SKIN} size={40} />}
            title="Skins"
            description="Choose your skin."
            onPress={() => navigation.navigate(VIEW.SKIN)}
            style={{}}
            titleStyle={{ color: playerStyle.colors.primary }}
            descriptionStyle={{ color: playerStyle.colors.secondary }}
          />
          <List.Item
            left={props => <IconButton icon={ICONS.BACKUP} size={40} />}
            title="Playlist Backup"
            description="Backup your playlists."
            onPress={() => navigation.navigate(VIEW.DUMMY)}
            style={{}}
            titleStyle={{ color: playerStyle.colors.primary }}
            descriptionStyle={{ color: playerStyle.colors.secondary }}
          />
          <List.Item
            left={props => <IconButton icon={ICONS.INFO} size={40} />}
            title="Info"
            description="Info about the app."
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
      <Stack.Screen name={VIEW.DUMMY} component={DummySettings} />
      <Stack.Screen name={VIEW.GENERAL} component={GeneralSettings} />
      <Stack.Screen name={VIEW.SKIN} component={SkinSettings} />
    </Stack.Navigator>
  );
};
