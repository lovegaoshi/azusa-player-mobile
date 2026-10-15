import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useFoldingFeature } from '@logicwind/react-native-fold-detection';

import AzusaPlayer from './APMPortrait';
import AzusaPlayerLandscape from './landscape/APMLandscape';
import AzusaPlayerFold from './fold/APMFold';
import PIPLyricView from './player/PIPLyric';
import { useNoxSetting } from '@stores/useApp';

interface Props extends NoxComponent.AppThemeProps {
  PIP: boolean;
  isLandscape: boolean;
}

const APM = ({ isLandscape }: { isLandscape: boolean }) => {
  const { layoutInfo, isFlat } = useFoldingFeature();

  if (isLandscape) return <AzusaPlayerLandscape />;
  // @ts-expect-error typing
  if (layoutInfo.isFoldSupported && layoutInfo.bounds === undefined) return;
  // @ts-expect-error typing
  if (layoutInfo.isFoldSupported && isFlat) return <AzusaPlayerFold />;
  return <AzusaPlayer />;
};

export default function APMView({
  PIP,
  isLandscape,
  defaultNavTheme,
  defaultTheme,
}: Props) {
  const playerStyle = useNoxSetting(state => state.playerStyle);

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
}
