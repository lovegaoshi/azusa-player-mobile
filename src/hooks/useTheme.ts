/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { getPlayerSkin } from '../utils/ChromeStorage';
import { useNoxSetting } from '@stores/useApp';

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
