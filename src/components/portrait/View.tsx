import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Playlist from '../playlist/View';
import Artist from '../artist/View';
import { NoxRoutes } from '@enums/Routes';

const Stack = createNativeStackNavigator();
const screenOptions = { headerShown: false };

export default () => {
  return (
    <Stack.Navigator initialRouteName={NoxRoutes.Artist}>
      <Stack.Screen
        name={NoxRoutes.Playlist}
        component={Playlist}
        options={screenOptions}
      />
      <Stack.Screen
        name={NoxRoutes.Artist}
        component={Artist}
        options={screenOptions}
      />
    </Stack.Navigator>
  );
};
