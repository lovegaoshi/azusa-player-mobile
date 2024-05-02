import React from 'react';
import { View } from 'react-native';

import { useNoxSetting } from '@stores/useApp';
import useAccentColor from '@hooks/useAccentColor';

export default ({ children }: { children: React.JSX.Element }) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const {} = useAccentColor(true);

  return (
    <View style={{ backgroundColor: playerStyle.colors.background, flex: 1 }}>
      {children}
    </View>
  );
};
