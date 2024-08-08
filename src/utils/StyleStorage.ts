import { Appearance } from 'react-native';

import { savePlayerSkin } from './ChromeStorage';
import { createStyle } from '../components/style';

export const getStyle = (v: NoxTheme.Style | NoxTheme.AdaptiveStyle) => {
  const isDark = v.isAdaptive && Appearance.getColorScheme() === 'dark';
  return (isDark ? (v.darkTheme ?? v) : v) as unknown as NoxTheme.Style;
};

export const savePlayerStyle = (
  v: NoxTheme.Style | NoxTheme.AdaptiveStyle,
  save = true
) => {
  const createdStyle = createStyle(getStyle(v));
  if (save) savePlayerSkin(v);
  return createdStyle;
};
