import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PluginSettings from './plugins/View';
import { useNoxSetting } from '@stores/useApp';
import SelectDialogWrapper from '../SelectDialogWrapper';
import { Route } from './enums';
import { Home } from './DeveloperSettings';

const Stack = createNativeStackNavigator();

const HomeWrapper = ({ navigation }: NoxComponent.StackNavigationProps) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  return (
    <SelectDialogWrapper
      viewStyle={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        flex: 1,
      }}
      Children={p => Home({ ...p, navigation })}
    />
  );
};

export default () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={Route.HOME}
        component={HomeWrapper}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={Route.PLUGINS}
        component={PluginSettings}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
