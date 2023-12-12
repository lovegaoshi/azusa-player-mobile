import { Dimensions, StyleSheet, View } from 'react-native';
import {
  Canvas,
  LinearGradient,
  Path,
  Skia,
  useClockValue,
  useComputedValue,
  useValue,
  vec,
} from '@shopify/react-native-skia';
import { line, curveBasis } from 'd3';
const dimension = Dimensions.get('window');
const width = dimension.width;
const height = 30;
const frequency = 2;
const initialAmplitude = 10;
const initialVerticalOffset = 10;

interface Props {
  playing?: boolean;
  progress?: number;
}
export default function WaveAnimation({
  playing = false,
  progress = 0,
}: Props) {
  const verticalOffset = useValue(initialVerticalOffset);
  const amplitude = useValue(initialAmplitude);
  const clock = useClockValue();
  const extrapolatedWidth = Math.max(width * progress * 0.9 - 3, 0);

  const createWavePath = (phase = 20) => {
    const points: [number, number][] = Array.from(
      { length: extrapolatedWidth },
      (_, index) => {
        const angle = (index / width) * (Math.PI * frequency) + phase;
        return [
          index,
          amplitude.current * Math.sin(angle) + verticalOffset.current + 10,
        ];
      }
    );
    const lineGenerator = line().curve(curveBasis);
    const waveLine = lineGenerator(points);
    const bottomLine = `L${extrapolatedWidth},${height} L${0}, ${height}`;
    return `${waveLine || bottomLine} ${bottomLine} Z`;
  };

  const animatedPath = useComputedValue(() => {
    const current = (clock.current / 500) % 255;
    const start = Skia.Path.MakeFromSVGString(createWavePath(current));
    const end = Skia.Path.MakeFromSVGString(createWavePath(Math.PI * current));
    return start!.interpolate(end!, 0.5)!;
  }, [clock, verticalOffset, progress]);

  const gradientStart = useComputedValue(() => {
    return vec(0, verticalOffset.current);
  }, [verticalOffset]);

  const gradientEnd = useComputedValue(() => {
    return vec(0, verticalOffset.current + 500);
  }, [verticalOffset]);

  if (!playing) return;

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
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
  },
  canvas: {
    flex: 1,
  },
});
