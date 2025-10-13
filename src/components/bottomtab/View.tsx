import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNoxSetting } from '@stores/useApp';
import NoxNativeBottomTab from './NoxNativeBottomTab';
import NoxBottomTab from './NoxBottomTab';

export default function BottomTabView({
  navigation,
}: NoxComponent.NavigationProps2) {
  const insets = useSafeAreaInsets();
  const gestureMode = useNoxSetting(state => state.gestureMode);
  const playerSetting = useNoxSetting(state => state.playerSetting);

  if (!(gestureMode || playerSetting.alwaysShowBottomTab)) {
    return <View style={{ height: insets.bottom }} />;
  }
  return playerSetting.nativeBottomTab ? (
    <NoxNativeBottomTab navigation={navigation} />
  ) : (
    <NoxBottomTab navigation={navigation} />
  );
}
