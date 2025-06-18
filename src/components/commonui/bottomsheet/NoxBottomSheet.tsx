import {
  SheetSize,
  TrueSheet,
  TrueSheetProps,
} from '@lodev09/react-native-true-sheet';
import { RefObject } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useNoxSetting } from '@stores/useApp';

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

  return (
    <TrueSheet
      {...p}
      draggingEnabled={draggable}
      backgroundColor={playerStyle.colors.surfaceVariant}
      sizes={sizes}
      cornerRadius={cornerRadius}
    >
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
