import React from 'react';
import { useStore } from 'zustand';

import noxPlayingList from '@stores/playingList';
import { cycleThroughPlaymode } from '@utils/RNTPUtils';
import ShadowedButton from '@components/buttons/ShadowedButton';

interface Props {
  iconSize?: number;
}
export default function PlayerModeButton({ iconSize = 30 }: Props) {
  const playMode = useStore(noxPlayingList, state => state.playmode);

  return (
    <ShadowedButton
      iconSize={iconSize}
      icon={playMode}
      onPress={() => cycleThroughPlaymode()}
      style={{ backgroundColor: undefined }}
    />
  );
}
