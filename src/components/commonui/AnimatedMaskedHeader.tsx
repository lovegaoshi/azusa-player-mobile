/**
 * an animated header component made with maskedView. the idea is:
 * when header renders, a spacer with height of headerHeight is inserted to the scrollable content;
 * header is position: absolute.
 * as content scrolls, header "hides" by translateY and overflow: hidden; vice versa.
 * this doesnt solve the problem that the header needs to mask the content below, so a
 * maskedView is used to hide that
 */

import { ReactNode, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';

interface Props {
  Header: () => ReactNode;
  Content: (p: {
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
    HeaderPlaceholderBlock: () => ReactNode;
  }) => ReactNode;
  fade?: boolean;
}

const AnimatedHeader = ({ Header, Content, fade }: Props) => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const scrollPosition = useSharedValue(0);
  const lastScrollPosition = useSharedValue(0);

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -scrollPosition.value }],
      opacity: fade ? 1 - scrollPosition.value / headerHeight : 1,
    };
  });

  const animatedHeaderPlaceholderStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight - scrollPosition.value,
    };
  });

  return (
    <View style={{ overflow: 'hidden' }}>
      <Animated.View
        style={[
          {
            // this is here because this implementation needs to add a spacer with headerHeight to content;
            // to avoid flickering the header is "invisible" when probing for headerHeight
            opacity: headerHeight === 0 ? 0 : 1,
            zIndex: 1,
            position: 'absolute',
          },
          animatedHeaderStyle,
        ]}
        onLayout={e => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <Header />
      </Animated.View>
      {headerHeight !== 0 && (
        <MaskedView
          maskElement={
            <View>
              <Animated.View style={animatedHeaderPlaceholderStyle} />
              <View
                style={{
                  backgroundColor: 'rgba(0,0,0,1)',
                  width: 9999,
                  height: 9999,
                }}
              />
            </View>
          }
          androidRenderingMode={'software'}
        >
          <Content
            HeaderPlaceholderBlock={() => (
              <View style={{ height: headerHeight }} />
            )}
            onScroll={e => {
              scrollPosition.value = clamp(
                scrollPosition.value -
                  lastScrollPosition.value +
                  e.nativeEvent.contentOffset.y,
                0,
                headerHeight,
              );
              lastScrollPosition.value = e.nativeEvent.contentOffset.y;
            }}
          />
        </MaskedView>
      )}
    </View>
  );
};

export default AnimatedHeader;
