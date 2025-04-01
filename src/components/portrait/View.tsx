import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Playlist from '../playlist/View';
import Artist from '../artist/View';
import { NoxRoutes } from '@enums/Routes';
import DefaultScreenOption from '@enums/ScreenOption';
import FlexView from '@components/commonui/FlexViewNewArch';

const Stack = createNativeStackNavigator();
const screenOptions = {
  headerShown: false,
  ...DefaultScreenOption,
};

export default () => {
  return (
    <FlexView>
      <Stack.Navigator>
        <Stack.Screen
          name={NoxRoutes.Playlist}
          component={Playlist}
          options={screenOptions}
        />
        <Stack.Screen
          name={NoxRoutes.Artist}
          component={Artist}
          options={{ ...screenOptions, freezeOnBlur: true }}
        />
      </Stack.Navigator>
    </FlexView>
  );
};
