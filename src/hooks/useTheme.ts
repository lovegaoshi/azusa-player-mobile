import { useEffect } from 'react';
import { useColorScheme, Appearance } from 'react-native';

import { getPlayerSkin, savePlayerSkin } from '../utils/ChromeStorage';
import { createStyle } from '../components/style';
import { resolveBackgroundImage } from '../components/background/MainBackground';

export const setPlayerStyle = async (
  val: NoxTheme.Style | NoxTheme.AdaptiveStyle,
  save = true
) => {
  const createFromStyle = val.isAdaptive
    ? Appearance.getColorScheme() === 'dark'
      ? val.darkTheme
      : val
    : val;
  const createdStyle = createStyle(createFromStyle);
  const bkgrdImg = await resolveBackgroundImage(createdStyle.bkgrdImg);
  if (save) savePlayerSkin(val);
  return {
    ...createdStyle,
    bkgrdImg,
  };
};

const useTheme = () => {
  const colorScheme = useColorScheme();

  const changeAdaptiveTheme = async () => {
    const currentTheme = await getPlayerSkin();
    if (currentTheme === null || !currentTheme?.isAdaptive) {
      return;
    }
  };

  useEffect(() => {
    changeAdaptiveTheme();
  }, [colorScheme]);
};

export default useTheme;
