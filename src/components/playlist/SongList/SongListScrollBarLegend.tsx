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

export interface LegendProps extends ScrollProps {
  data?: unknown[];
  index?: SharedValue<number>;
  processData?: (data: unknown) => string;
}

export const LegendExample = ({
  data = [],
  index,
  scrollPosition,
  processData,
}: LegendProps) => {
  const [text, setText] = useState('');

  useAnimatedReaction(
    () => scrollPosition.value,
    curr => {
      runOnJS(setText)(
        processData?.(data?.[index?.value ?? 0]) ?? String(curr),
      );
    },
  );

  return <Text>{text}</Text>;
};
