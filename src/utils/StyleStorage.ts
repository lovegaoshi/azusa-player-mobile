import { Appearance } from 'react-native';

import { savePlayerSkin } from './ChromeStorage';
import { createStyle } from '../components/style';

export const savePlayerStyle = (
  val: NoxTheme.Style | NoxTheme.AdaptiveStyle,
  save = true
) => {
  const isDark = val.isAdaptive && Appearance.getColorScheme() === 'dark';
  const createFromStyle = isDark ? val.darkTheme : val;
  const createdStyle = createStyle(createFromStyle);
  if (save) savePlayerSkin(val);
  return createdStyle;
};
