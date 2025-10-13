import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Dimensions, View } from 'react-native';

import { NoxRoutes } from '@enums/Routes';
import Explore from '../explore/View';
import LandscapeLyricView from './LandscapeLyric';
import { SettingsLandscape as Settings } from '../setting/View';
import Playlist from '../playlist/View';
import { Playlists } from '../playlists/Playlists';
import DefaultScreenOption from '@enums/ScreenOption';

const Stack = createNativeStackNavigator();

interface Props {
  panelWidth: number;
}

export default function LandscapePlaylistPanel({ panelWidth }: Props) {
  const panelStyle = {
    width: panelWidth,
    // HACK: WHY?
    height: Dimensions.get('window').height,
  };

  return (
    <View style={panelStyle}>
      <Stack.Navigator>
        <Stack.Screen
          name={NoxRoutes.Lyrics}
          options={{ headerShown: false, ...DefaultScreenOption }}
        >
          {() => <LandscapeLyricView panelStyle={panelStyle} />}
        </Stack.Screen>
        <Stack.Screen
          name={NoxRoutes.Playlist}
          component={Playlist}
          options={{ headerShown: false, ...DefaultScreenOption }}
        />
        <Stack.Screen
          name={NoxRoutes.PlaylistsDrawer}
          component={Playlists}
          options={{ headerShown: false, ...DefaultScreenOption }}
        />
        <Stack.Screen
          name={NoxRoutes.Explore}
          component={Explore}
          options={{ headerShown: false, ...DefaultScreenOption }}
        />
        <Stack.Screen
          name={NoxRoutes.Settings}
          component={Settings}
          options={{ headerShown: false, ...DefaultScreenOption }}
        />
      </Stack.Navigator>
    </View>
  );
}
