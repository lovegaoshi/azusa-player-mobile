import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';

import { ViewEnum } from '@enums/View';
import DummySettings from '../setting/DummySettings';
import LandscapeLyricView from './LandscapeLyric';
import Settings from '../setting/View';

const Stack = createNativeStackNavigator();

interface Props {
  panelWidth: number;
}

export default ({ panelWidth }: Props) => {
  return (
    <View style={{ width: panelWidth }}>
      <Stack.Navigator>
        <Stack.Screen
          name={ViewEnum.LYRICS}
          component={LandscapeLyricView}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={ViewEnum.PLAYER_PLAYLIST}
          component={DummySettings}
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
