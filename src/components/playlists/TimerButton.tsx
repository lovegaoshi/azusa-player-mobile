import React from 'react';
import { IconButton } from 'react-native-paper';
import { useNoxSetting } from '@stores/useApp';
import TimerDialog from './TimerDialog';

export default () => {
  const [timerVisible, setTimerVisible] = React.useState(false);
  const playerStyle = useNoxSetting(state => state.playerStyle);

  const onDismiss = React.useCallback(() => setTimerVisible(false), []);

  return (
    <React.Fragment>
      <IconButton
        icon="timer-outline"
        onPress={() => setTimerVisible(true)}
        iconColor={playerStyle.colors.primary}
      />
      <TimerDialog visible={timerVisible} onClose={onDismiss} />
    </React.Fragment>
  );
};
