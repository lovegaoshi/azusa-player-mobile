import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { View } from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { List, MD3Colors, IconButton, Text } from 'react-native-paper';
import GeneralSettings from './GeneralSettings';
import SkinSettings from './SkinSettings';
import { useNoxSetting } from '../../hooks/useSetting';
import { ViewEnum } from '../../enums/View';

enum ICONS {
  HOME = 'cog',
  // TODO: need to figure out the skin object story first before implementing this
  SKIN = 'palette-outline',
  // TODO: need to figure out bili SESSIONDATA first before implementing this.
  // though a good time to think about oauth2 now
  BACKUP = 'cloud-upload',
  INFO = 'information',
}

enum VIEW {
  HOME = 'Settings',
  DUMMY = 'Features not implemented',
  GENERAL = 'General',
  SKIN = 'Skins',
}

const Stack = createNativeStackNavigator();

export default () => {
  const navigation = useNavigation();
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

  const HomeSettings = ({
    navigation,
  }: {
    navigation: NativeStackNavigationProp<ParamListBase>;
  }) => {
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
          // TODO: is there a non retarded way to do this?
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              size={25}
              style={{ paddingRight: 20 }}
              onPress={() => navigation.navigate(ViewEnum.PLAYER_HOME as never)}
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
