import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  return (
    <FlexView style={{ paddingTop: insets.top }}>
      <Stack.Navigator>
        <Stack.Screen
          name={NoxRoutes.Playlist}
          component={Playlist}
          options={screenOptions}
          getId={() => NoxRoutes.Playlist}
        />
        <Stack.Screen
          name={NoxRoutes.Artist}
          component={Artist}
          options={{ ...screenOptions, freezeOnBlur: true }}
          getId={() => NoxRoutes.Artist}
        />
      </Stack.Navigator>
    </FlexView>
  );
};
