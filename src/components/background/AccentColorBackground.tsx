import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { FastAverageColor } from 'fast-average-color';

import useActiveTrack from '@hooks/useActiveTrack';
import { useNoxSetting } from '@stores/useApp';

const fac = new FastAverageColor();

export default ({ children }: { children: React.JSX.Element }) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const [backgroundColor, setBackgroundColor] = useState<string>(
    playerStyle.colors.background
  );
  const { track } = useActiveTrack();

  const getBackgroundColor = async () => {
    try {
      if (playerSetting.accentColor) {
        const color = await fac.getColorAsync(track?.artwork, {
          algorithm: 'dominant',
        });
        setBackgroundColor(color.hex);
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

  return <View style={{ backgroundColor }}>{children}</View>;
};
