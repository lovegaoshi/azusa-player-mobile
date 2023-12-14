import { Dimensions, StyleSheet, View } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  useClockValue,
  useComputedValue,
  useValue,
  LinearGradient,
  vec,
} from '@shopify/react-native-skia';
import { line, curveBasis } from 'd3';
import { colord } from 'colord';

import { gaussian } from '@utils/Gaussian';

const dimension = Dimensions.get('window');
const width = dimension.width;
const height = 30;
const frequency = 2;
const initialAmplitude = 3;
const initialVerticalOffset = 10;
const samplingInterval = 10;

interface Props {
  playing?: boolean;
  progress?: number;
  color?: string;
}
export default function WaveAnimation({
  playing = false,
  progress = 0,
  color = 'white',
}: Props) {
  const verticalOffset = useValue(initialVerticalOffset);
  const amplitude = useValue(initialAmplitude);
  const clock = useClockValue();
  const extrapolatedWidth = Math.max(width * progress * 0.9 - 3, 0);
  const parsedColor = colord(color);

  const createWavePath = (phase = 20) => {
    const points: [number, number][] =
      extrapolatedWidth < samplingInterval
        ? []
        : Array.from(
            { length: Math.floor(extrapolatedWidth / samplingInterval) },
            (_, index) => {
              index *= samplingInterval;
              const angle = (1 - index / width) * (Math.PI * frequency) + phase;
              return [
                index,
                amplitude.current *
                  (Math.sin(angle) - 1) *
                  gaussian(index / extrapolatedWidth) +
                  verticalOffset.current +
                  17,
              ];
            }
          );
    const lineGenerator = line().curve(curveBasis);
    const waveLine = lineGenerator(points);
    const bottomLine = `L${extrapolatedWidth},${height} L${0}, ${height}`;
    return waveLine
      ? `${waveLine} ${bottomLine} Z`
      : `L${0},${0} L${0}, ${0} L${0},${0} L${0}, ${0} Z`;
  };

  const animatedPath = useComputedValue(() => {
    const current = (clock.current / 500) % 255;
    const start = Skia.Path.MakeFromSVGString(createWavePath(current));
    const end = Skia.Path.MakeFromSVGString(createWavePath(Math.PI * current));
    return start!.interpolate(end!, 0.5)!;
  }, [clock, verticalOffset, progress]);

  const animatedPath2 = useComputedValue(() => {
    const current = (clock.current / 700) % 255;
    const start = Skia.Path.MakeFromSVGString(createWavePath(current));
    const end = Skia.Path.MakeFromSVGString(createWavePath(Math.PI * current));
    return start!.interpolate(end!, 0.5)!;
  }, [clock, verticalOffset, progress]);

  const gradientStart = useComputedValue(() => {
    return vec(0, 0);
  }, [width]);

  const gradientEnd = useComputedValue(() => {
    return vec(width, 0);
  }, [width]);

  if (!playing) return <></>;

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Path
          path={animatedPath2}
          style={'fill'}
          color={parsedColor.hue(20).toRgbString()}
        ></Path>
        <Path path={animatedPath} style={'fill'} color={color}>
          {false && (
            <LinearGradient
              start={gradientStart}
              end={gradientEnd}
              colors={['cyan', 'blue']}
            />
          )}
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
