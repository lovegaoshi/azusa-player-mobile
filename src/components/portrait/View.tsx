import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Playlist from '../playlist/View';
import Artist from '../artist/View';
import { NoxRoutes } from '@enums/Routes';
import DefaultScreenOption from '@enums/ScreenOption';
import FlexView from '@components/commonui/FlexViewNewArch';
import { useNoxSetting } from '@stores/useApp';

const Stack = createNativeStackNavigator();
const screenOptions = {
  headerShown: false,
  ...DefaultScreenOption,
};

export default function PortraitView() {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <FlexView
      mkey={'music'}
      style={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
      }}
    >
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
}
