import React from 'react';
import { Pressable, Text } from 'react-native';
import { Track } from 'react-native-track-player';
import { useTranslation } from 'react-i18next';

import useArtist from '@stores/explore/artist';
import useNavigation from '@hooks/useNavigation';
import { NoxRoutes } from '@enums/Routes';
import useSnack from '@stores/useSnack';
import { useNoxSetting } from '@stores/useApp';

interface Props {
  track?: Track;
  style?: any;
}

export default ({ track, style }: Props) => {
  const fetch = useArtist(state => state.fetch);
  const setSnack = useSnack(state => state.setSnack);
  const miniPlayerCollapse = useNoxSetting(state => state.collapse);
  const navigationG = useNavigation();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={() => {
        if (fetch(track?.song)) {
          miniPlayerCollapse();
          return navigationG.navigate({
            route: NoxRoutes.PlayerHome,
            params: { screen: NoxRoutes.Artist },
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
