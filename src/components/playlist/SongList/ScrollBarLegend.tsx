import React, { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useNoxSetting } from '@stores/useApp';

export interface ScrollProps {
  scrollPosition: SharedValue<number>;
}

export interface LegendProps extends ScrollProps {
  showLegend: SharedValue<number>;
}

interface CustomLegendProps<T> extends LegendProps {
  data?: T[];
  index?: SharedValue<number>;
  processData?: (data: T) => string;
}

const TextPadding = 5;

export const LegendExample = ({
  data = [],
  index,
  scrollPosition,
  processData,
  showLegend,
}: CustomLegendProps<unknown>) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const [debouncedText, setdebouncedText] = useState('');
  const [text, setText] = useState('');
  const legendBoxStyle = {
    width: 50,
    height: 50,
    backgroundColor: playerStyle.colors.primaryContainer,
    borderRadius: 7,
    borderBottomRightRadius: 0,
  };
  const actualTextLength = useSharedValue(0);
  const prevTextLength = useSharedValue(0);

  const changeText = (scrollPos: number) => {
    setText(processData?.(data?.[index?.value ?? 0]) ?? String(scrollPos));
  };

  useAnimatedReaction(
    () => scrollPosition.value,
    curr => {
      runOnJS(changeText)(curr);
    },
  );

  const animatedLegendStyle = useAnimatedStyle(() => {
    const legendWidth =
      (TextPadding * 2 + actualTextLength.value ||
        (legendBoxStyle?.width as number)) ??
      0;
    // const legendHeight = (legendBoxStyle?.height as number) ?? legendWidth;
    const expanding = actualTextLength.value > prevTextLength.value;
    return {
      height: undefined,
      opacity: showLegend.value,
      right: withTiming(legendWidth + 5, { duration: expanding ? 120 : 0 }),
      width: legendWidth,
      /*
      // center it
      top:
        barHeightP.value > legendHeight
          ? (barHeightP.value - legendHeight) / 2
          : undefined,
      */
    };
  });
  return (
    <Animated.View style={[legendBoxStyle, animatedLegendStyle]}>
      <View
        style={{
          width: 999,
          height: 20,
          flex: 1,
          flexDirection: 'row',
          position: 'absolute',
          opacity: 0,
        }}
      >
        <Text
          onLayout={e => {
            prevTextLength.value = actualTextLength.value;
            actualTextLength.value = e.nativeEvent.layout.width;
            setdebouncedText(text);
          }}
        >
          {text}
        </Text>
        <View style={{ flex: 1 }}></View>
      </View>
      <Text
        style={{
          paddingRight: TextPadding,
          color: playerStyle.colors.primary,
          alignSelf: 'flex-end',
        }}
      >
        {debouncedText}
      </Text>
    </Animated.View>
  );
};
