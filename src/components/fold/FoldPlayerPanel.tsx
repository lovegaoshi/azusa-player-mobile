import { View } from 'react-native';
import React from 'react';

import PlayerView from '../miniplayer/View';

interface Props {
  panelWidth: number;
}
export default function LandscapePlayerPanel({ panelWidth }: Props) {
  return (
    <View style={{ width: panelWidth }}>
      <PlayerView viewWidth={panelWidth} draggingEnabled={false} />
    </View>
  );
}
