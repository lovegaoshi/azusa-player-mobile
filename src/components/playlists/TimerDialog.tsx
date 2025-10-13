import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Dialog, Portal, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import useTimer from './useTimerRN';
import { useNoxSetting } from '@stores/useApp';
import { PaperText as Text } from '@components/commonui/ScaledText';

interface Props {
  visible: boolean;
  onClose?: () => void;
}

const TimerDialog = ({ visible, onClose = () => undefined }: Props) => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const {
    minutes,
    seconds,
    startTimer,
    setMinutes,
    setSeconds,
    timerRestart,
    timerStart,
    timerPause,
  } = useTimer();

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog visible={visible} onDismiss={handleClose} style={styles.dialog}>
      <Dialog.Title style={styles.dialogTitle}>
        {t('SleepTimer.Title')}
      </Dialog.Title>
      <Dialog.Content>
        <View style={styles.inputContainer}>
          <TextInput
            keyboardType="numeric"
            style={styles.input}
            value={String(minutes)}
            onChangeText={text => setMinutes(Number.parseInt(text) || 0)}
            disabled={startTimer}
            textAlign="right"
            selectionColor={playerStyle.customColors.textInputSelectionColor}
          />
          <Text style={styles.separator}>：</Text>
          <TextInput
            keyboardType="numeric"
            style={styles.input2}
            value={String(seconds)}
            onChangeText={text => setSeconds(Number.parseInt(text) || 0)}
            disabled={startTimer}
            selectionColor={playerStyle.customColors.textInputSelectionColor}
          />
        </View>
        <View style={styles.buttonsContainer}>
          <IconButton
            icon={startTimer ? 'pause' : 'play'}
            onPress={() => {
              // eslint-disable-next-line no-unused-expressions
              startTimer ? timerPause() : timerStart();
            }}
            size={30}
          />
          <IconButton size={30} icon="refresh" onPress={() => timerRestart()} />
        </View>
      </Dialog.Content>
    </Dialog>
  );
};

export default function TimerDialogPortal(p: Props) {
  return (
    <Portal>
      <TimerDialog {...p} />
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    width: '60%',
  },
  dialogTitle: {
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
  },
  input: {
    fontSize: 25,
    flex: 1,
    textAlign: 'right',
    marginRight: -10,
  },
  input2: { fontSize: 25, flex: 1, marginLeft: -17 },
  separator: {
    fontSize: 25,
    textAlign: 'center',
    paddingTop: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 40,
  },
});
