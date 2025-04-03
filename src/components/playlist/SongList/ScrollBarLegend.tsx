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

export interface LegendProps<T> extends ScrollProps {
  data?: T[];
  index?: SharedValue<number>;
  processData?: (data: T) => string;
}

export const LegendExample = ({
  data = [],
  index,
  scrollPosition,
  processData,
}: LegendProps<unknown>) => {
  const [text, setText] = useState('');

  const changeText = (scrollPos: number) => {
    setText(processData?.(data?.[index?.value ?? 0]) ?? String(scrollPos));
  };

  useAnimatedReaction(
    () => scrollPosition.value,
    curr => {
      runOnJS(changeText)(curr);
    },
  );

  return <Text>{text}</Text>;
};
