import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Dimensions, View } from 'react-native';

import { NoxRoutes } from '@enums/Routes';
import Explore from '../explore/View';
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
    // HACK: WHY?
    height: Dimensions.get('window').height - 25,
  };

  return (
    <View style={panelStyle}>
      <Stack.Navigator>
        <Stack.Screen name={NoxRoutes.Lyrics} options={{ headerShown: false }}>
          {() => <LandscapeLyricView panelStyle={panelStyle} />}
        </Stack.Screen>
        <Stack.Screen
          name={NoxRoutes.Playlist}
          component={Playlist}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={NoxRoutes.PlaylistsDrawer}
          component={Playlists}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={NoxRoutes.Explore}
          component={Explore}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={NoxRoutes.Settings}
          component={Settings}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </View>
  );
};
