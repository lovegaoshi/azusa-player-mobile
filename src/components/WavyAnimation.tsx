import { Dimensions, StyleSheet, View } from 'react-native';
import {
  Canvas,
  LinearGradient,
  Path,
  Skia,
  useClockValue,
  useComputedValue,
  useTouchHandler,
  useValue,
  vec,
} from '@shopify/react-native-skia';
import { line, curveBasis } from 'd3';
const dimension = Dimensions.get('window');
const width = dimension.width;
const height = dimension.height;
const frequency = 2;
const initialAmplitude = 10;
const initialVerticalOffset = 100;

export default function WaveAnimation() {
  const verticalOffset = useValue(initialVerticalOffset);
  const amplitude = useValue(initialAmplitude);
  const clock = useClockValue();

  const createWavePath = (phase = 20) => {
    const points: [number, number][] = Array.from(
      { length: width },
      (_, index) => {
        const angle = (index / width) * (Math.PI * frequency) + phase;
        return [
          index,
          amplitude.current * Math.sin(angle) + verticalOffset.current,
        ];
      }
    );
    const lineGenerator = line().curve(curveBasis);
    const waveLine = lineGenerator(points);
    const bottomLine = `L${width},${height} L${0}, ${height}`;
    return `${waveLine} ${bottomLine} Z`;
  };

  const animatedPath = useComputedValue(() => {
    const current = (clock.current / 255) % 255;
    const start = Skia.Path.MakeFromSVGString(createWavePath(current));
    const end = Skia.Path.MakeFromSVGString(createWavePath(Math.PI * current));
    return start!.interpolate(end!, 0.5)!;
  }, [clock, verticalOffset]);

  const gradientStart = useComputedValue(() => {
    return vec(0, verticalOffset.current);
  }, [verticalOffset]);

  const gradientEnd = useComputedValue(() => {
    return vec(0, verticalOffset.current + 500);
  }, [verticalOffset]);

  const onToucHandler = useTouchHandler({
    onActive: ({ y }) => {
      if (y > initialVerticalOffset) {
        verticalOffset.current = Math.min(height, y);
        amplitude.current = Math.max(
          0,
          (height - verticalOffset.current) * 0.025
        );
      }
    },
  });

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas} onTouch={onToucHandler}>
        <Path path={animatedPath} style={'fill'} color={'cyan'}>
          <LinearGradient
            start={gradientStart}
            end={gradientEnd}
            colors={['cyan', 'blue']}
          />
        </Path>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  canvas: {
    flex: 1,
  },
});
