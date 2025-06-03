import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import AzusaPlayer from './APMPortrait';
import AzusaPlayerLandscape from './landscape/APMLandscape';
import PIPLyricView from './player/PIPLyric';
import { useNoxSetting } from '@stores/useApp';

interface Props extends NoxComponent.AppThemeProps {
  PIP: boolean;
  isLandscape: boolean;
}

const APM = ({ isLandscape }: { isLandscape: boolean }) => {
  if (isLandscape) return <AzusaPlayerLandscape />;
  return <AzusaPlayer />;
};

export default ({ PIP, isLandscape, defaultNavTheme, defaultTheme }: Props) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  console.log('123115');
  if (PIP) return <PIPLyricView />;
  return (
    <NavigationContainer
      theme={{
        ...defaultTheme,
        colors: {
          ...defaultTheme.colors,
          ...playerStyle.colors,
          // HACK: compensate for my bad design. now applying background
          // at MainBackground level instaed of here.
          background: undefined,
        },
        fonts: defaultNavTheme.fonts,
      }}
    >
      <APM isLandscape={isLandscape} />
    </NavigationContainer>
  );
};
