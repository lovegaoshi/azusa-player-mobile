import { DefaultTheme } from 'react-native-paper';
import AzusaTheme from './AzusaThemeRaw';

export default {
  ...AzusaTheme,
  colors: {
    ...DefaultTheme.colors,
    ...AzusaTheme.colors,
  },
} as NoxTheme.Style;
