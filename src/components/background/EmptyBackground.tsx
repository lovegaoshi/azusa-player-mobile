import React from 'react';
import { View } from 'react-native';

import { useNoxSetting } from '@stores/useApp';

export default ({ children }: { children: React.JSX.Element }) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <View style={{ backgroundColor: playerStyle.colors.background, flex: 1 }}>
      {children}
    </View>
  );
};
