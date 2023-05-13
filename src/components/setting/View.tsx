import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { ParamListBase } from '@react-navigation/native';
import { List, MD3Colors, IconButton } from 'react-native-paper';
import GeneralSettings from './GeneralSettings';

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
}

const Stack = createNativeStackNavigator();

export default () => {
  function DummySettings() {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 60, color: 'black' }}>
          Feature not implemented
        </Text>
      </View>
    );
  }

  function HomeSettings({
    navigation,
  }: {
    navigation: NativeStackNavigationProp<ParamListBase>;
  }) {
    return (
      <View style={{}}>
        <List.Section>
          <List.Item
            left={props => <IconButton icon={ICONS.HOME} size={40} />}
            title="General Settings"
            description="General settings for the app."
            onPress={() => navigation.navigate(VIEW.GENERAL)}
            style={{}}
          />
          <List.Item
            left={props => <IconButton icon={ICONS.SKIN} size={40} />}
            title="Skins"
            description="Choose your skin."
            onPress={() => navigation.navigate(VIEW.DUMMY)}
            style={{}}
          />
          <List.Item
            left={props => <IconButton icon={ICONS.BACKUP} size={40} />}
            title="Playlist Backup"
            description="Backup your playlists."
            onPress={() => navigation.navigate(VIEW.DUMMY)}
            style={{}}
          />
          <List.Item
            left={props => <IconButton icon={ICONS.INFO} size={40} />}
            title="Info"
            description="Info about the app."
            onPress={() => navigation.navigate(VIEW.DUMMY)}
            style={{}}
          />
        </List.Section>
      </View>
    );
  }

  return (
    <Stack.Navigator>
      <Stack.Screen name={VIEW.HOME} component={HomeSettings} />
      <Stack.Screen name={VIEW.DUMMY} component={DummySettings} />
      <Stack.Screen name={VIEW.GENERAL} component={GeneralSettings} />
    </Stack.Navigator>
  );
};
