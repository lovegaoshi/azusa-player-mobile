import React, { useEffect } from 'react';
import TrackPlayer, { RepeatMode } from 'react-native-track-player';
import { IconButton } from 'react-native-paper';

import { NoxRepeatMode } from './enums/RepeatMode';
import { useNoxSetting } from '../../hooks/useSetting';
import noxPlayingList from '../../stores/playingList';
import { savePlayMode } from '../../utils/ChromeStorage';

const { getState, setState } = noxPlayingList;

export default () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const [playModeState, setPlayModeState] = React.useState<string>(
    getState().playmode
  );

  const setPlayMode = (val: string) => {
    setState({ playmode: val });
    setPlayModeState(val);
    savePlayMode(val);
    switch (val) {
      case NoxRepeatMode.REPEAT_TRACK:
        TrackPlayer.setRepeatMode(RepeatMode.Track);
        break;
      default:
        TrackPlayer.setRepeatMode(RepeatMode.Queue);
    }
  };

  const onClickPlaymode = () => {
    switch (getState().playmode) {
      case NoxRepeatMode.SHUFFLE:
        setPlayMode(NoxRepeatMode.REPEAT);
        break;
      case NoxRepeatMode.REPEAT:
        setPlayMode(NoxRepeatMode.REPEAT_TRACK);
        break;
      case NoxRepeatMode.REPEAT_TRACK:
        setPlayMode(NoxRepeatMode.SUGGEST);
        break;
      case NoxRepeatMode.SUGGEST:
        setPlayMode(NoxRepeatMode.SHUFFLE);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setPlayMode(playModeState);
  }, []);

  return (
    <IconButton
      icon={playModeState}
      onPress={onClickPlaymode}
      mode={playerStyle.playerControlIconContained}
      size={30}
      style={{
        backgroundColor: playerStyle.customColors.btnBackgroundColor,
      }}
    />
  );
};
