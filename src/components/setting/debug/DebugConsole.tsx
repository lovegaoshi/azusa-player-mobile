import React from 'react';
import TrackPlayer from 'react-native-track-player';
import { NativeModules } from 'react-native';

import GenericDialog from '@components/dialogs/GenericDialog';
import showLog from './Log';

const { NoxModule } = NativeModules;

export default () => {
  const [visible] = React.useState(false);
  return <GenericDialog visible={visible}></GenericDialog>;
};

export const showDebugLog = async () => {
  const log = `TP.volume: ${await TrackPlayer.getVolume()}\n
    TP.activeTrack: ${JSON.stringify(await TrackPlayer.getActiveTrack())}\n
    LastExitCode: ${await NoxModule?.getLastExitCode?.()}`;
  showLog(log);
};
