import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { useNoxSetting } from '@stores/useApp';

export default function EmptyBackground({ children }: PropsWithChildren) {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <View style={{ backgroundColor: playerStyle.colors.background, flex: 1 }}>
      {children}
    </View>
  );
}
