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
    height: Dimensions.get('window').height,
  };

  const WrappedLyricView = () => <LandscapeLyricView panelStyle={panelStyle} />;

  return (
    <View style={panelStyle}>
      <Stack.Navigator>
        <Stack.Screen
          name={NoxRoutes.Lyrics}
          component={WrappedLyricView}
          options={{ headerShown: false }}
        />
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
