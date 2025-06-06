import React from 'react';
import { View } from 'react-native';

import useAccentColor from '@hooks/useAccentColor';

export default () => {
  const { backgroundColor } = useAccentColor();

  return (
    <View
      style={{
        backgroundColor,
        flex: 1,
        position: 'absolute',
        width: 9999,
        height: 8888,
      }}
    />
  );
};
