import React from 'react';
import { View } from 'react-native';

import useAccentColor from '@hooks/useAccentColor';

export default ({ children }: { children: React.JSX.Element }) => {
  const { backgroundColor } = useAccentColor();

  return <View style={{ backgroundColor, flex: 1 }}>{children}</View>;
};
