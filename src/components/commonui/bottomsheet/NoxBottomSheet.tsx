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
}

export default (p: Props) => {
  const {
    cornerRadius = 5,
    children,
    sizes = ['auto', 'large'],
    draggable,
  } = p;
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const [topOffset, setTopOffset] = useState(0);
  const [leftOffset, setLeftOffset] = useState(0);
  const ref = useRef<View>(null);

  useEffect(() => {
    isAndroid &&
      !isOldArch() &&
      ref.current?.measure((_x, _y, _width, _height, pageX, pageY) => {
        setTopOffset(-pageY);
        setLeftOffset(-pageX);
      });
  }, []);

  return (
    <TrueSheet
      {...p}
      positionOffset={{ top: topOffset, left: leftOffset }}
      draggingEnabled={draggable}
      backgroundColor={playerStyle.colors.surfaceVariant}
      sizes={sizes}
      cornerRadius={cornerRadius}
    >
      <Pressable ref={ref} />
      {/* https://sheet.lodev09.com/troubleshooting#react-native-gesture-handler */}
      <GestureHandlerRootView style={styles.RNGHcontainer}>
        <ScrollView>
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
