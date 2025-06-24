import {
  SheetSize,
  TrueSheet,
  TrueSheetProps,
} from '@lodev09/react-native-true-sheet';
import { RefObject, useEffect, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useNoxSetting } from '@stores/useApp';
import { isAndroid, isOldArch } from '@utils/RNUtils';

interface Props extends TrueSheetProps {
  name: string;
  ref: RefObject<TrueSheet | null>;
  cornerRadius?: number;
  sizes?: SheetSize[];
  children?: React.ReactNode;
  draggable?: boolean;
  Header?: () => React.ReactNode;
  nestedScrollEnabled?: boolean;
}

export default (p: Props) => {
  const {
    cornerRadius = 5,
    children,
    sizes = ['auto', 'large'],
    draggable,
    onDismiss,
    Header = () => null,
    nestedScrollEnabled,
  } = p;
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const [topOffset, setTopOffset] = useState(0);
  const [leftOffset, setLeftOffset] = useState(0);
  const [scrollViewShouldNest, setScrollViewShouldNest] = useState(false);
  const scrollViewHeight = useRef(0);
  const pressableRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    isAndroid &&
      !isOldArch() &&
      pressableRef.current?.measure((_x, _y, _width, _height, pageX, pageY) => {
        setTopOffset(-pageY);
        setLeftOffset(-pageX);
      });
  }, []);

  return (
    <TrueSheet
      {...p}
      dismissWithAnimation
      keyboardMode={'pan'}
      positionOffset={{ top: topOffset, left: leftOffset }}
      draggingEnabled={draggable}
      backgroundColor={playerStyle.colors.surfaceVariant}
      sizes={sizes}
      cornerRadius={cornerRadius}
      // @ts-expect-error typing issues
      scrollRef={scrollViewRef}
      onDismiss={() => {
        onDismiss?.();
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
      }}
    >
      <Pressable ref={pressableRef} />
      {/* https://sheet.lodev09.com/troubleshooting#react-native-gesture-handler */}
      <GestureHandlerRootView style={styles.RNGHcontainer}>
        <Header />
        <ScrollView
          onLayout={e =>
            (scrollViewHeight.current = e.nativeEvent.layout.height)
          }
          onContentSizeChange={(_w, h) =>
            setScrollViewShouldNest(h > scrollViewHeight.current)
          }
          // HACK: this is totally not necessary. consider removing
          nestedScrollEnabled={nestedScrollEnabled ?? scrollViewShouldNest}
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
        >
          {children}
          <View style={styles.footer} />
        </ScrollView>
      </GestureHandlerRootView>
    </TrueSheet>
  );
};

const styles = StyleSheet.create({
  RNGHcontainer: {
    flexGrow: 1,
  },
  footer: { paddingBottom: 10 },
});
