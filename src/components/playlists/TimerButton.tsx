import React from 'react';
import { IconButton } from 'react-native-paper';
import TimerDialog from './TimerDialog';

export default () => {
  const [timerVisible, setTimerVisible] = React.useState(false);

  const onDismiss = React.useCallback(() => setTimerVisible(false), []);

  return (
    <React.Fragment>
      <IconButton icon="timer-outline" onPress={() => setTimerVisible(true)} />
      <TimerDialog
        visible={timerVisible}
        onClose={onDismiss}
        onSubmit={onDismiss}
      />
    </React.Fragment>
  );
};
