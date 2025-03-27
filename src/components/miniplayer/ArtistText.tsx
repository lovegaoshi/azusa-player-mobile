import React from 'react';
import { Pressable, Text } from 'react-native';
import { Track } from 'react-native-track-player';
import { useTranslation } from 'react-i18next';

import useArtist from '@stores/explore/artist';
import useNavigation from '@hooks/useNavigation';
import { NoxRoutes } from '@enums/Routes';
import useSnack from '@stores/useSnack';

interface Props {
  track?: Track;
  style?: any;
}

export default ({ track, style }: Props) => {
  const fetch = useArtist(state => state.fetch);
  const setSnack = useSnack(state => state.setSnack);
  const navigationG = useNavigation();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={() => {
        if (fetch(track?.song)) {
          return navigationG.navigate({
            route: NoxRoutes.PlayerHome,
            options: { screen: NoxRoutes.Artist },
          });
        }
        setSnack({
          snackMsg: { success: t('Artist.SiteNotSupported') },
        });
      }}
    >
      <Text style={style}>{track?.artist}</Text>
    </Pressable>
  );
};
