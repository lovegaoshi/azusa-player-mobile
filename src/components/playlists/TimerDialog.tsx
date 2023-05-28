import React, { useState } from 'react';
import { View } from 'react-native';
import {
  IconButton,
  Dialog,
  Portal,
  TextInput,
  Text,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import useTimer from './useTimer';

interface props {
  visible: boolean;
  onClose?: () => void;
  onSubmit?: () => void;
}

export default ({
  visible,
  onClose = () => undefined,
  onSubmit = () => undefined,
}: props) => {
  const { t } = useTranslation();
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
  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={handleClose}
        style={{ width: '50%' }}
      >
        <Dialog.Title style={{ textAlign: 'center' }}>
          {t('SleepTimer.Title')}
        </Dialog.Title>
        <Dialog.Content>
          <View style={{ flexDirection: 'row' }}>
            <TextInput
              keyboardType="numeric"
              style={{
                fontSize: 25,
                flex: 1,
                textAlign: 'right',
                marginRight: -10,
              }}
              value={String(minutes)}
              onChangeText={text => setMinutes(parseInt(text) || 0)}
              disabled={startTimer}
              textAlign="right"
            />
            <Text style={{ fontSize: 25, textAlign: 'center', paddingTop: 8 }}>
              ：
            </Text>
            <TextInput
              keyboardType="numeric"
              style={{ fontSize: 25, flex: 1, marginLeft: -17 }}
              value={String(seconds)}
              onChangeText={text => setSeconds(parseInt(text) || 0)}
              disabled={startTimer}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              height: 40,
            }}
          >
            <IconButton
              icon={startTimer ? 'pause' : 'play'}
              onPress={() => {
                startTimer ? timerPause() : timerStart();
              }}
              size={30}
            />
            <IconButton
              size={30}
              icon="refresh"
              onPress={() => timerRestart()}
            />
          </View>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
};
