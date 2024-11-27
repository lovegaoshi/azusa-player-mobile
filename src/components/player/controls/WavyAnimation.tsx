import { Dimensions, StyleSheet, View } from 'react-native';
import {
  Canvas,
  Path,
  useClock,
  LinearGradient,
  vec,
} from '@shopify/react-native-skia';
import React from 'react';
import {
  useDerivedValue as useComputedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { colord } from 'colord';

const dimension = Dimensions.get('window');
const width = dimension.width;
const height = 30;
const initialVerticalOffset = 10;

interface Point {
  x: number;
  y: number;
}

interface CalculateWavePoints {
  points?: number;
  w: number;
  step: number;
  speed?: number;
  amplitude?: number;
  h?: number;
}
const _calculateWavePoints = ({
  points = 3,
  w = width,
  h = height,
  step,
  speed = 0.15,
  amplitude = 20,
}: CalculateWavePoints) => {
  'worklet';
  return [...Array(Math.max(points, 1) + 1)].map((v, i) => {
    'worklet';
    const scale = 100;
    const x = (i / points) * w;
    const seed = (step + (i + (i % points))) * speed * scale;
    const height = Math.sin(seed / scale) * amplitude;
    const y = Math.sin(seed / scale) * height + h;
    return { x, y };
  });
};

const cubic = (a: Point, b: Point) => {
  'worklet';
  return ` C ${a.x} ${a.y} ${a.x} ${a.y} ${b.x} ${b.y}`;
};

const _buildPath = (points: Point[], w: number, h: number) => {
  'worklet';
  let svg = `M ${points[0].x} ${h}`;
  const initial = {
    x: (points[1].x - points[0].x) / 2,
    y: points[1].y * 2 - points[0].y,
  };
  svg += cubic(initial, points[1]);
  let point = initial;
  [...Array(points.length - 2)].forEach((v, i) => {
    'worklet';
    point = {
      x: points[i + 1].x - point.x + points[i + 1].x,
      y: points[i + 1].y - point.y + points[i + 1].y,
    };
    svg += cubic(point, points[i + 2]);
  });
  svg += ` L ${w} ${h}`;
  svg += ` L 0 ${h} Z`;
  return svg;
};

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
  const verticalOffset = useSharedValue(initialVerticalOffset);
  const extrapolatedWidth = Math.max(width * progress * 0.9 - 3, 0);
  const parsedColor = colord(color);
  const clock = useClock();

  const animatedPath = useComputedValue(() => {
    'worklet';
    return _buildPath(
      _calculateWavePoints({
        points: 3,
        step: clock.value / 2500,
        w: extrapolatedWidth,
        h: 15,
        speed: 5,
        amplitude: 5,
      }),
      extrapolatedWidth,
      height,
    );
  }, [verticalOffset, progress]);

  const animatedPath2 = useComputedValue(() => {
    'worklet';
    return _buildPath(
      _calculateWavePoints({
        points: 3,
        step: clock.value / 2500 + 0.5,
        w: extrapolatedWidth,
        h: 15,
        speed: 5,
        amplitude: 5,
      }),
      extrapolatedWidth,
      height,
    );
  }, [verticalOffset, progress]);

  const gradientStart = useComputedValue(() => {
    'worklet';
    return vec(0, 0);
  }, [width]);

  const gradientEnd = useComputedValue(() => {
    'worklet';
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
        >
          {false && (
            <LinearGradient
              start={gradientStart}
              end={gradientEnd}
              colors={['cyan', 'blue']}
            />
          )}
        </Path>
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
