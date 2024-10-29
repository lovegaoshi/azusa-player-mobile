import React from 'react';
import { IconButton } from 'react-native-paper';

import { NoxRoutes } from '@enums/Routes';
import usePlayback from '@hooks/usePlayback';
import useNavigation from '@hooks/useNavigation';

export default () => {
  const navigation = useNavigation();
  const { shuffleAll } = usePlayback();
  const onPressed = async () => {
    await shuffleAll();
    navigation.navigate(NoxRoutes.PlayerHome);
  };

  return <IconButton icon="shuffle" onPress={onPressed} />;
};
