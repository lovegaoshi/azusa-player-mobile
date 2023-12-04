/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useColorScheme, Appearance } from 'react-native';

import { getPlayerSkin, savePlayerSkin } from '../utils/ChromeStorage';
import { createStyle } from '../components/style';
import { resolveBackgroundImage } from '../components/background/MainBackground';
import { useNoxSetting } from '@stores/useApp';

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

const useTheme = () => {
  const setPlayerStyleState = useNoxSetting(state => state.setPlayerStyle);
  const colorScheme = useColorScheme();

  const changeAdaptiveTheme = async () => {
    const currentTheme = await getPlayerSkin();
    if (currentTheme === null || !currentTheme?.isAdaptive) {
      return;
    }
    setPlayerStyleState(currentTheme, false);
  };

  useEffect(() => {
    changeAdaptiveTheme();
  }, [colorScheme]);
};

export default useTheme;
