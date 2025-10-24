import {
  SheetSize,
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

const isAndroidNewArch = isAndroid;

interface Props extends TrueSheetProps {
  name: string;
  ref: RefObject<TrueSheet | null>;
  cornerRadius?: number;
  sizes?: SheetSize[];
  children?: React.ReactNode;
  draggable?: boolean;
  Header?: (p: { setHeaderHeight?: (v: number) => void }) => React.ReactNode;
  nestedScrollEnabled?: boolean;
  ScrollHeader?: () => React.ReactNode;
}

export default function NoxBottomSheet(p: Props) {
  const {
    cornerRadius = 5,
    children,
    sizes = ['auto', 'large'],
    draggable,
    onDismiss,
    Header = () => null,
    ScrollHeader = () => null,
    nestedScrollEnabled,
  } = p;
  const insets = useSafeAreaInsets();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const [topOffset, setTopOffset] = useState(0);
  const [leftOffset, setLeftOffset] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [scrollViewShouldNest, setScrollViewShouldNest] = useState<boolean>();
  const [sheetPresent, setSheetPresent] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { height } = Dimensions.get('window');
  const pressableRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    isAndroidNewArch &&
      pressableRef.current?.measure((_x, _y, _width, _height, pageX, pageY) => {
        setTopOffset(-pageY);
        setLeftOffset(-pageX);
        setInitialized(true);
      });
  }, []);

  return (
    <TrueSheet
      {...p}
      edgeToEdge
      onPresent={() => isAndroidNewArch && setSheetPresent(true)}
      dismissWithAnimation
      keyboardMode={'pan'}
      positionOffset={
        sheetPresent
          ? { top: topOffset, left: leftOffset }
          : // HACK: android only to move the sheet to a nonexistent plane AFTER
            // the measure offset event is fired
            initialized
            ? { top: -9999 }
            : undefined
      }
      draggingEnabled={draggable}
      backgroundColor={playerStyle.colors.surfaceVariant}
      sizes={sizes}
      cornerRadius={cornerRadius}
      // @ts-expect-error typing issues
      scrollRef={scrollViewRef}
      onDismiss={() => {
        onDismiss?.();
        setSheetPresent(false);
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
            stickyHeaderIndices={[0]}
          >
            <ScrollHeader />
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
