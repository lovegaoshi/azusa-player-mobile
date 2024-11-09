import React from 'react';
import { IconButton } from 'react-native-paper';

import { NoxRoutes } from '@enums/Routes';
import usePlayback from '@hooks/usePlayback';
import useNavigation from '@hooks/useNavigation';
import { useNoxSetting } from '@stores/useApp';

export default () => {
  const navigation = useNavigation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const { shuffleAll } = usePlayback();
  const onPressed = async () => {
    await shuffleAll();
    navigation.navigate({ route: NoxRoutes.PlayerHome });
  };

  return (
    <IconButton
      icon="shuffle"
      onPress={onPressed}
      iconColor={playerStyle.colors.primary}
    />
  );
};
