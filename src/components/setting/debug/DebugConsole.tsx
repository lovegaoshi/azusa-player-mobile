import React from 'react';
import TrackPlayer from 'react-native-track-player';

import GenericDialog from '@components/dialogs/GenericDialog';
import showLog from './Log';
import NativeNoxModule from '@specs/NativeNoxModule';

export default () => {
  const [visible] = React.useState(false);
  return <GenericDialog visible={visible}></GenericDialog>;
};

export const showDebugLog = async () => {
  const log = `TP.volume: ${await TrackPlayer.getVolume()}\n
    LastExitCode: ${NativeNoxModule?.getLastExitCode?.()}\n
    Mem Usage: ${NativeNoxModule?.getRAMUsage?.()}\n
    TP.activeTrack: ${JSON.stringify(await TrackPlayer.getActiveTrack())}\n`;
  showLog(log);
};
