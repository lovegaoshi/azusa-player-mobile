import { Button, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useRef } from 'react';

export default () => {
  const sheet = useRef<TrueSheet>(null);
  const zoom = useSharedValue(1);
  const borderRadius = useSharedValue(0);
  const yOffset = useSharedValue(0);

  const zoomOut = () => {
    zoom.value = 0.98;
    borderRadius.value = 10;
    yOffset.value = 30;
    sheet.current?.present();
  };
  const zoomIn = () => {
    zoom.value = 1;
    borderRadius.value = 1;
    yOffset.value = 0;
    sheet.current?.dismiss();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withTiming(zoom.value) },
        { translateY: withTiming(yOffset.value) },
      ],
      borderRadius: withTiming(borderRadius.value),
    };
  });

  return (
    <>
      <Animated.View
        style={[{ flex: 1, backgroundColor: 'black' }, animatedStyle]}
      >
        <Text>test</Text>
        <Button title="open" onPress={zoomOut} />
        <View style={{ paddingVertical: 10 }}></View>
        <Button title="close" onPress={zoomIn} />
      </Animated.View>
      <TrueSheet
        name="sheet"
        ref={sheet}
        sizes={['auto', 'large']}
        cornerRadius={5}
        onDismiss={zoomIn}
      >
        <View style={{ height: 100 }}></View>
        <Button title="close" onPress={zoomIn}></Button>
        <View style={{ height: 100 }}></View>
      </TrueSheet>
    </>
  );
};
