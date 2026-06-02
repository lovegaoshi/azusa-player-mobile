import { View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isAndroid } from '@utils/RNUtils';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export default () => {
  if (!isAndroid) return null;
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  return (
    <View
      style={{
        height: Math.max(0, insets.top),
        backgroundColor: (colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme)
          .colors.elevation.level2,
      }}
    />
  );
};
