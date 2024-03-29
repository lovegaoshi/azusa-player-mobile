import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Dimensions, View } from 'react-native';

import { ViewEnum } from '@enums/View';
import DummySettings from '../setting/DummySettings';
import LandscapeLyricView from './LandscapeLyric';
import { SettingsLandscape as Settings } from '../setting/View';
import Playlist from '../playlist/View';
import Playlists from '../playlists/Playlists';

const Stack = createNativeStackNavigator();

interface Props {
  panelWidth: number;
}

export default ({ panelWidth }: Props) => {
  const panelStyle = {
    width: panelWidth,
    height: Dimensions.get('window').height,
  };

  const WrappedLyricView = () => <LandscapeLyricView panelStyle={panelStyle} />;

  return (
    <View style={panelStyle}>
      <Stack.Navigator>
        <Stack.Screen
          name={ViewEnum.LYRICS}
          component={WrappedLyricView}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={ViewEnum.PLAYER_PLAYLIST}
          component={Playlist}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={ViewEnum.PLAYER_PLAYLISTS}
          component={Playlists}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={ViewEnum.EXPORE}
          component={DummySettings}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={ViewEnum.SETTINGS}
          component={Settings}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </View>
  );
};
