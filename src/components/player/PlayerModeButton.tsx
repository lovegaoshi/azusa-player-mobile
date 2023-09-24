import React from 'react';
import { IconButton } from 'react-native-paper';
import { useStore } from 'zustand';

import { useNoxSetting } from '@hooks/useSetting';
import noxPlayingList from '@stores/playingList';
import { cycleThroughPlaymode } from '@utils/RNTPUtils';

interface Props {
  iconSize?: number;
}
export default ({ iconSize = 30 }: Props) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const playMode = useStore(noxPlayingList, state => state.playmode);

  return (
    <IconButton
      icon={playMode}
      onPress={cycleThroughPlaymode}
      mode={playerStyle.playerControlIconContained}
      size={iconSize}
      style={{
        backgroundColor: playerStyle.customColors.btnBackgroundColor,
      }}
    />
  );
};
