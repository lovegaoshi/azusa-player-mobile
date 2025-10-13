import { View } from 'react-native';
import { useActiveTrack } from 'react-native-track-player';
import React from 'react';

import TrackInfoTemplate from '../player/TrackInfo/TrackInfoTemplate';
import LandscapePlayerProgress from './LandscapePlayerProgress';

interface Props {
  panelWidth: number;
}
export default function LandscapePlayerPanel({ panelWidth }: Props) {
  const track = useActiveTrack();
  return (
    <View style={{ justifyContent: 'flex-end', width: panelWidth }}>
      <TrackInfoTemplate
        track={track}
        windowWidth={panelWidth}
        containerStyle={{ flex: 1, justifyContent: 'center' }}
      >
        <></>
      </TrackInfoTemplate>
      <LandscapePlayerProgress panelWidth={panelWidth} />
    </View>
  );
}
