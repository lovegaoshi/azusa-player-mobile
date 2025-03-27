import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Playlist from '../playlist/View';
import { NoxRoutes } from '@enums/Routes';

const Stack = createNativeStackNavigator();
const screenOptions = { headerShown: false };

export default () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={NoxRoutes.Playlist}
        component={Playlist}
        options={screenOptions}
      />
    </Stack.Navigator>
  );
};
