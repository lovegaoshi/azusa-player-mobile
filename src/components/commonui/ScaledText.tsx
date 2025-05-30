import { TextProps, Text as RNText, StyleSheet } from 'react-native';
import { Text, TextProps as PaperTextProps } from 'react-native-paper';

import { typescale } from './PaperTextVariant';
import { useNoxSetting } from '@stores/useApp';

interface PaperProps<T> extends PaperTextProps<T> {
  scale?: number;
}

export const PaperText = (p: PaperProps<never>) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const { style, variant, scale } = p;
  const { fontSize, lineHeight } = typescale[variant ?? 'titleSmall'];
  const flattenedStyle = StyleSheet.flatten(style);
  const finalScale = scale ?? playerSetting.fontScale ?? 1;
  const scaledStyle = {
    fontSize: (flattenedStyle?.fontSize ?? fontSize) * finalScale,
    lineHeight: (flattenedStyle?.lineHeight ?? lineHeight) * finalScale,
  };
  const newStyle = Array.isArray(style)
    ? [...style, scaledStyle]
    : [style, scaledStyle];

  return <Text {...p} style={newStyle} />;
};

interface NativeProps extends TextProps {
  scale?: number;
}

export const NativeText = (p: NativeProps) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const { style, scale } = p;
  const flattenedStyle = StyleSheet.flatten(style);
  const finalScale = scale ?? playerSetting.fontScale ?? 1;
  const scaledStyle = {
    fontSize: (flattenedStyle?.fontSize ?? 14) * finalScale,
    lineHeight: flattenedStyle?.lineHeight
      ? flattenedStyle?.lineHeight * (scale ?? 1)
      : undefined,
  };
  const newStyle = Array.isArray(style)
    ? [...style, scaledStyle]
    : [style, scaledStyle];

  return <RNText {...p} style={newStyle} />;
};
