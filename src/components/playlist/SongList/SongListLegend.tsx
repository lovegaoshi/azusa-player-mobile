import { useState } from 'react';
import { Text } from 'react-native';
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
} from 'react-native-reanimated';

export interface ScrollProps {
  scrollPosition: SharedValue<number>;
}

export default ({ scrollPosition }: ScrollProps) => {
  const [text, setText] = useState('');

  useAnimatedReaction(
    () => scrollPosition.value,
    curr => {
      runOnJS(setText)(String(curr));
    },
  );

  return <Text>{text}</Text>;
};
