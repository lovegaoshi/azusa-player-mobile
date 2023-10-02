/**
 * TODO: i did waste a lot of time on this, but at its core this package
 * react-native-countdown-circle-timer is not using setInterval i think and thus
 * the timer countdown unmounts when the dialog is closed. Everything else looks good.
 * i will stick to my stupid timer from noxplayer
 * for now until I figure this out.
 *
 * why would you make a timer but not use setInterval though?
 */

import React, { useState } from 'react';
import {
  IconButton,
  Dialog,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { View } from 'react-native';
import {
  CountdownCircleTimer,
  Props as CircleTimerProps,
} from 'react-native-countdown-circle-timer';
import TrackPlayer from 'react-native-track-player';
import { seconds2MMSS } from '@utils/Utils';

const HHMMSS2Seconds = (time: string): number => {
  const timeFactor = [1, 60, 60];
  const times = time.split(':').map(Number).reverse();
  return times.reduce(
    (acc, currentVal, currentIndex) =>
      acc + currentVal * timeFactor[currentIndex],
    0
  );
};

const extractNumbersFromString = (input: string): number[] => {
  const regex = /\d+/g;
  const matches = input.match(regex);
  if (matches) {
    return matches.map(Number);
  }
  return [0];
};

const joinNumbersToString = (numbers: number[]): string => {
  const joinedString = numbers.reduce(
    (acc: string, curr: number) => acc + curr.toString(),
    ''
  );
  const trimmedString = joinedString.slice(
    Math.max(0, joinedString.length - 6)
  );
  return trimmedString.replace(/\d{1,2}(?=(\d{2})+(?!\d))/g, '$&:');
};

const parseTimerInput = (input: string): string =>
  joinNumbersToString(extractNumbersFromString(input));

interface Props {
  visible: boolean;
  onClose?: () => void;
  onSubmit?: () => void;
}

export default ({ visible, onClose = () => undefined }: Props) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(1800);
  const [inputDuration, setInputDuration] = React.useState('3000');
  const [refresh, setRefresh] = useState(false);
  const [showTimerRemaining, setShowTimerRemaining] = useState(false);

  const handleClose = () => {
    onClose();
  };

  const CircleTimerWrapper = React.useCallback(
    (props: CircleTimerProps) => {
      return (
        <CountdownCircleTimer {...props}>{props.children}</CountdownCircleTimer>
      );
    },
    [refresh]
  );

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={handleClose}
        style={{ width: 220, height: 300 }}
      >
        <View>
          <View style={{ paddingBottom: 20, paddingLeft: 20 }}>
            <CircleTimerWrapper
              isPlaying={isPlaying}
              duration={duration}
              colors={['#004777', '#F7B801', '#A30000', '#A30000']}
              colorsTime={[10, 6, 3, 0]}
              onComplete={() => {
                TrackPlayer.pause();
                return {
                  newInitialRemainingTime: HHMMSS2Seconds(
                    parseTimerInput(inputDuration)
                  ),
                };
              }}
              onUpdate={console.debug}
              updateInterval={1}
            >
              {({ remainingTime, color }) =>
                isPlaying ? (
                  <Text
                    style={{ color, fontSize: 40, textAlign: 'center' }}
                    adjustsFontSizeToFit={true}
                    numberOfLines={1}
                  >
                    {seconds2MMSS(remainingTime)}
                  </Text>
                ) : (
                  <View>
                    <Text
                      style={{
                        position: 'absolute',
                        fontSize: 40,
                        width: 100,
                        textAlign: 'center',
                      }}
                      adjustsFontSizeToFit={true}
                      numberOfLines={1}
                    >
                      {showTimerRemaining
                        ? seconds2MMSS(remainingTime)
                        : parseTimerInput(inputDuration)}
                    </Text>
                    <TextInput
                      style={{
                        width: 100,
                        fontSize: 25,
                        backgroundColor: 'transparent',
                      }}
                      textColor="transparent"
                      selectionColor="transparent"
                      cursorColor="transparent"
                      keyboardType="numeric"
                      value={inputDuration}
                      onChangeText={t => {
                        setInputDuration(t);
                        setDuration(HHMMSS2Seconds(parseTimerInput(t)));
                      }}
                      onFocus={() => setShowTimerRemaining(false)}
                      clearTextOnFocus
                      selectTextOnFocus
                    ></TextInput>
                  </View>
                )
              }
            </CircleTimerWrapper>
          </View>
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <IconButton
              icon={isPlaying ? 'pause' : 'play'}
              onPress={() => {
                setIsPlaying(prev => !prev);
                setShowTimerRemaining(true);
              }}
              size={30}
            />
            <IconButton
              size={30}
              icon="refresh"
              onPress={() => {
                setDuration(HHMMSS2Seconds(parseTimerInput(inputDuration)));
                setIsPlaying(false);
                setShowTimerRemaining(false);
                setRefresh(prev => !prev);
              }}
            />
          </View>
        </View>
      </Dialog>
    </Portal>
  );
};
