import { Appearance } from 'react-native';

import { savePlayerSkin } from './ChromeStorage';
import { createStyle } from '../components/style';
import { resolveBackgroundImage } from '@utils/mediafetch/mainbackgroundfetch';

export const savePlayerStyle = async (
  val: NoxTheme.Style | NoxTheme.AdaptiveStyle,
  save = true
) => {
  const createFromStyle = val.isAdaptive
    ? Appearance.getColorScheme() === 'dark'
      ? val.darkTheme
      : val
    : val;
  const createdStyle = createStyle(createFromStyle);
  if (save) savePlayerSkin(val);
  return {
    ...createdStyle,
    bkgrdImg: await resolveBackgroundImage(createdStyle.bkgrdImg),
  };
};
