import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import SkinSettings from './SkinSettings';
import { useNoxSetting } from '@stores/useApp';
import DefaultScreenOption from '@enums/ScreenOption';
import Home, { VIEW } from './AppearanceSetting';

const Stack = createNativeStackNavigator();

const HomeWrapper = ({ navigation }: NoxComponent.StackNavigationProps) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <View
      style={[
        styles.homeSettingsContainer,
        { backgroundColor: playerStyle.customColors.maskedBackgroundColor },
      ]}
    >
      <Home navigation={navigation} />
    </View>
  );
};

const AppearanceSetting = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={VIEW.HOME}
        component={HomeWrapper}
        options={{
          headerShown: false,
          ...DefaultScreenOption,
          freezeOnBlur: true,
        }}
      />
      <Stack.Screen
        name={VIEW.SKIN}
        component={SkinSettings}
        options={{ headerShown: false, ...DefaultScreenOption }}
      />
    </Stack.Navigator>
  );
};
export default AppearanceSetting;

const styles = StyleSheet.create({
  dummySettingsContainer: {
    flex: 1,
  },
  dummySettingsText: {
    fontSize: 60,
    paddingLeft: 20,
  },
  homeSettingsContainer: {
    flex: 1,
  },
  menuButton: {
    width: 55,
    marginLeft: -5,
  },
});
