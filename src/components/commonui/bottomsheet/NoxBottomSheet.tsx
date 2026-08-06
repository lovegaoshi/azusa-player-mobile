import {
  SheetDetent,
  TrueSheet,
  TrueSheetProps,
} from '@lodev09/react-native-true-sheet';
import { RefObject, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  View,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNoxSetting } from '@stores/useApp';
import { isAndroid, isIOS } from '@utils/RNUtils';

interface Props extends TrueSheetProps {
  name: string;
  ref: RefObject<TrueSheet | null>;
  cornerRadius?: number;
  sizes?: SheetDetent[];
  children?: React.ReactNode;
  draggable?: boolean;
  Header?: (p: { setHeaderHeight?: (v: number) => void }) => React.ReactNode;
  nestedScrollEnabled?: boolean;
}

export default function NoxBottomSheet(p: Props) {
  const {
    cornerRadius = 5,
    children,
    sizes = ['auto'],
    draggable,
    onDidDismiss,
    Header = () => null,
    nestedScrollEnabled,
  } = p;
  const insets = useSafeAreaInsets();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [scrollViewShouldNest, setScrollViewShouldNest] = useState<boolean>();
  const { height } = Dimensions.get('window');
  const pressableRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <TrueSheet
      {...p}
      backgroundColor={playerStyle.colors.surfaceVariant}
      detents={sizes}
      cornerRadius={cornerRadius}
      // @ts-expect-error typing issues
      scrollRef={scrollViewRef}
      onDidDismiss={e => {
        onDidDismiss?.(e);
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
      }}
    >
      <Pressable ref={pressableRef} />
      {/* https://sheet.lodev09.com/troubleshooting#react-native-gesture-handler */}
      <GestureHandlerRootView style={styles.RNGHcontainer}>
        {(p.sizes?.findIndex?.(v => v.toString().includes('%')) ?? -1) < 0 && (
          <View style={{ height: insets.top }} />
        )}
        <Header setHeaderHeight={isIOS ? setHeaderHeight : undefined} />
        {isAndroid && scrollViewShouldNest === undefined ? (
          <View
            style={{ position: 'absolute' }}
            onLayout={e =>
              setScrollViewShouldNest(e.nativeEvent.layout.height > height)
            }
          >
            {children}
          </View>
        ) : (
          <ScrollView
            contentInset={{ top: headerHeight }}
            nestedScrollEnabled={nestedScrollEnabled ?? scrollViewShouldNest}
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
          >
            {children}
            <View style={{ paddingBottom: insets.bottom }} />
          </ScrollView>
        )}
      </GestureHandlerRootView>
    </TrueSheet>
  );
}

const styles = StyleSheet.create({
  RNGHcontainer: {
    flexGrow: 1,
  },
});
