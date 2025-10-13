import * as React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PluginSettings from './plugins/View';
import { useNoxSetting } from '@stores/useApp';
import SelectDialogWrapper from '../SelectDialogWrapper';
import { Route } from './enums';
import { Home } from './DeveloperSettings';
import MFSettings from './plugins/musicfree/View';
import DefaultScreenOption from '@enums/ScreenOption';

const Stack = createNativeStackNavigator();

const HomeWrapper = ({ navigation }: NoxComponent.StackNavigationProps) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  return (
    <View
      style={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        flex: 1,
      }}
    >
      <SelectDialogWrapper
        Children={p => <Home {...p} navigation={navigation} />}
      />
    </View>
  );
};

export default function DeveloperSettingView() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={Route.HOME}
        component={HomeWrapper}
        options={{ headerShown: false, ...DefaultScreenOption }}
      />
      <Stack.Screen
        name={Route.PLUGINS}
        component={PluginSettings}
        options={{ headerShown: false, ...DefaultScreenOption }}
      />
      <Stack.Screen
        name={Route.MUSICFREE}
        component={MFSettings}
        options={{ headerShown: false, ...DefaultScreenOption }}
      />
    </Stack.Navigator>
  );
}
