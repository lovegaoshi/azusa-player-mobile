import { View } from 'react-native';
import React from 'react';

import { APMDrawer } from '../APMPortrait';

interface Props {
  panelWidth: number;
}
export default function FoldPlaylistPanel({ panelWidth }: Props) {
  return (
    <View style={{ width: panelWidth }}>
      <APMDrawer alwaysShowBottomTab={true} />
    </View>
  );
}
