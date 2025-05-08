import { SheetSize, TrueSheet } from '@lodev09/react-native-true-sheet';
import { RefObject } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useNoxSetting } from '@stores/useApp';

interface Props {
  name: string;
  ref: RefObject<TrueSheet | null>;
  cornerRadius?: number;
  sizes?: SheetSize[];
  children?: React.ReactNode;
}

export default ({
  name,
  ref,
  cornerRadius = 5,
  children,
  sizes = ['auto', 'large'],
}: Props) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <TrueSheet
      name={name}
      ref={ref}
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
