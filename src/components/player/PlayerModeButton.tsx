import React from 'react';
import { IconButton } from 'react-native-paper';
import { useStore } from 'zustand';

import { useNoxSetting } from '@hooks/useSetting';
import noxPlayingList, { cycleThroughPlaymode } from '@stores/playingList';

export default () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const playMode = useStore(noxPlayingList, state => state.playmode);

  return (
    <IconButton
      icon={playMode}
      onPress={cycleThroughPlaymode}
      mode={playerStyle.playerControlIconContained}
      size={30}
      style={{
        backgroundColor: playerStyle.customColors.btnBackgroundColor,
      }}
    />
  );
};
