import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNoxSetting } from '@stores/useApp';
import NoxNativeBottomTab from './NoxNativeBottomTab';
import NoxBottomTab from './NoxBottomTab';

interface Props extends NoxComponent.NavigationProps2 {
  alwaysShowBottomTab?: boolean;
}
export default function BottomTabView({
  navigation,
  alwaysShowBottomTab = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const gestureMode = useNoxSetting(state => state.gestureMode);
  const playerSetting = useNoxSetting(state => state.playerSetting);

  if (!(
    gestureMode ||
    playerSetting.alwaysShowBottomTab ||
    alwaysShowBottomTab
  )) {
    return <View style={{ height: insets.bottom }} />;
  }
  return playerSetting.nativeBottomTab ? (
    <NoxNativeBottomTab navigation={navigation} />
  ) : (
    <NoxBottomTab navigation={navigation} />
  );
}
