import * as React from 'react';
import {
  View,
  Animated,
  StyleSheet,
  PanResponder,
  Dimensions,
} from 'react-native';
import Image from 'react-native-fast-image';

import { localSplashes } from '../background/AppOpenSplash';

export default () => {
  const [index, setIndex] = React.useState(0);
  const position = React.useRef(new Animated.ValueXY()).current;
  const panResponder = React.useRef(
    PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
        // if (Math.abs(gestureState.dy) < Math.abs(gestureState.dx)) {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
        // }
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded

        if (gestureState.dx > 120) {
          Animated.timing(position, {
            toValue: { x: WindowWidth + 100, y: gestureState.dy },
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            console.log('splashes moved on right');
            nextImage();
            position.setValue({ x: 0, y: 0 });
          });
        } else if (gestureState.dx < -120) {
          Animated.timing(position, {
            toValue: { x: -WindowWidth + 100, y: gestureState.dy },
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            console.log('splashes moved on left');
            nextImage();
            position.setValue({ x: 0, y: 0 });
          });
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    })
  ).current;

  const nextImage = () => {
    console.log('splash to next', index);
    setIndex(val => (val < localSplashes.length - 1 ? val + 1 : 0));
  };

  const isIndexEnd = (i: number) => {
    return index === localSplashes.length - 1 && i === 0;
  };

  React.useEffect(() => console.log('splash', index), [index]);

  return (
    <View style={styles.view}>
      {localSplashes
        .map((splash, i) => (
          <Animated.View
            style={[
              styles.animatedView,
              i === index && {
                transform: [
                  ...position.getTranslateTransform(),
                  {
                    rotate: position.x.interpolate({
                      inputRange: [-WindowWidth / 2, 0, WindowWidth / 2],
                      outputRange: ['-10deg', '0deg', '10deg'],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              },
              (i === index + 1 || isIndexEnd(i)) && {
                transform: [
                  {
                    scale: position.x.interpolate({
                      inputRange: [-WindowWidth / 2, 0, WindowWidth / 2],
                      outputRange: [1, 0.8, 1],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
                opacity: position.x.interpolate({
                  inputRange: [-WindowWidth / 2, 0, WindowWidth / 2],
                  outputRange: [1, 0, 1],
                  extrapolate: 'clamp',
                }),
              },
              isIndexEnd(i) && {
                zIndex: -1,
              },
            ]}
            key={i}
            {...panResponder.panHandlers}
          >
            <Image
              // source={i < index || i > index + 1 ? undefined : splash()}
              source={
                (i >= index && i < index + 2) || isIndexEnd(i)
                  ? splash()
                  : undefined
              }
              style={styles.splashCard}
              resizeMode={Image.resizeMode.contain}
            />
          </Animated.View>
        ))
        .reverse()}
    </View>
  );
};

const WindowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  view: {
    flex: 1,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  expandObject: {
    flex: 1,
  },
  animatedView: {
    flex: 1,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    position: 'absolute',
  },
  splashCard: {
    flex: 1,
  },
});
