import React, { RefObject, useState } from 'react';
import { FlashListRef } from '@shopify/flash-list';
import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

import { useNoxSetting } from '@stores/useApp';
import { NativeText as Text } from '@components/commonui/ScaledText';
import bs from '@utils/binarySearch';

export interface ScrollProps {
  scrollOffset: SharedValue<number>;
  scrollViewReference: RefObject<FlashListRef<NoxMedia.Song> | null>;
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
  scrollOffset,
  processData,
  showLegend,
  scrollViewReference,
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

  const changeText = (offset: number) => {
    (async () => {
      const bsindex = bs({
        dataLen: data.length,
        target: offset,
        comparator: (a, b) => a - b,
        getData: i => scrollViewReference.current?.getLayout(i)?.y ?? 0,
      });
      setText(processData?.(data?.[Math.abs(bsindex)]) ?? String(offset));
    })();
  };

  useAnimatedReaction(
    () => scrollOffset.value,
    curr => {
      if (showLegend.value === 0) {
        return;
      }
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
      opacity: withTiming(showLegend.value, { duration: 100 }),
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
      <View style={styles.invisibleFlexTextContainer}>
        <Text
          onLayout={e => {
            prevTextLength.value = actualTextLength.value;
            actualTextLength.value = e.nativeEvent.layout.width;
            setdebouncedText(text);
          }}
          numberOfLines={1}
        >
          {text}
        </Text>
        <View style={styles.flex}></View>
      </View>
      <Text
        style={{
          paddingRight: TextPadding,
          color: playerStyle.colors.primary,
          alignSelf: 'flex-end',
        }}
        numberOfLines={1}
      >
        {debouncedText}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  invisibleFlexTextContainer: {
    width: 999,
    height: 20,
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    opacity: 0,
  },
  flex: { flex: 1 },
});
