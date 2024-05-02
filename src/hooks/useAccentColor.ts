import { useEffect, useState } from 'react';
import { getColors } from 'react-native-image-colors';

import useActiveTrack from './useActiveTrack';
import { useNoxSetting } from '@stores/useApp';

export default () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const [backgroundColor, setBackgroundColor] = useState<string>(
    playerStyle.colors.background
  );
  const { track } = useActiveTrack();

  const getBackgroundColor = async () => {
    try {
      if (track?.artwork && playerSetting.accentColor) {
        const color = await getColors(track?.artwork, {});
        switch (color.platform) {
          case 'android':
            setBackgroundColor(color.dominant);
            break;
          case 'ios':
            setBackgroundColor(color.primary);
            break;
          case 'web':
            setBackgroundColor(color.dominant);
            break;
        }
        return;
      }
    } catch (e) {
      console.warn(e);
    }
    setBackgroundColor(playerStyle.colors.background);
  };

  useEffect(() => {
    getBackgroundColor();
  }, [track]);

  return { backgroundColor };
};
