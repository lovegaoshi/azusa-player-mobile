import {
  TextProps,
  Text as RNText,
  StyleSheet,
  StyleProp,
  TextStyle,
} from 'react-native';
import {
  Text,
  TextProps as _PaperTextProps,
  List,
  ListItemProps,
} from 'react-native-paper';
import _MarqueeText, { TextTickerProps } from 'react-native-text-ticker';
import { RectButton } from 'react-native-gesture-handler';

import { typescale } from './PaperTextVariant';
import { useNoxSetting } from '@stores/useApp';

interface HookProps {
  style?: StyleProp<TextStyle>;
  scale?: number;
  setLineHeight?: boolean;
  defaultFontSize?: number;
  defaultLineHeight?: number;
  defaultScale?: number;
}
const useScale = ({
  style,
  scale,
  setLineHeight = false,
  defaultFontSize = 14,
  defaultLineHeight = 16,
  defaultScale = 1,
}: HookProps) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const flattenedStyle = StyleSheet.flatten(style);
  const finalScale = scale ?? playerSetting.fontScale ?? defaultScale;
  const scaledStyle = {
    fontSize: (flattenedStyle?.fontSize ?? defaultFontSize) * finalScale,
    lineHeight:
      flattenedStyle?.lineHeight || setLineHeight
        ? (flattenedStyle?.lineHeight ?? defaultLineHeight) *
          (scale ?? defaultScale)
        : undefined,
  };
  const newStyle = Array.isArray(style)
    ? [...style, scaledStyle]
    : [style, scaledStyle];

  return newStyle;
};

interface PaperTextProps<T> extends _PaperTextProps<T> {
  scale?: number;
}

export const PaperText = (p: PaperTextProps<never>) => {
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

interface NativeTextProps extends TextProps {
  scale?: number;
}

export const NativeText = (p: NativeTextProps) => {
  const scaledStyle = useScale(p);

  return <RNText {...p} style={scaledStyle} />;
};

interface PaperListItemProps extends ListItemProps {
  scale?: number;
}

export const PaperListItem = (p: PaperListItemProps) => {
  const scaledTitleStyle = useScale({ style: p.titleStyle, scale: p.scale });
  const scaledDescStyle = useScale({
    style: p.descriptionStyle,
    scale: p.scale,
  });

  return (
    // TODO: use a wrapper here
    // @ts-expect-error
    <RectButton onPress={p.onPress}>
      <List.Item
        {...p}
        onPress={undefined}
        titleStyle={scaledTitleStyle}
        descriptionStyle={scaledDescStyle}
      />
    </RectButton>
  );
};

interface MarqueeTextProps extends TextTickerProps {
  scale?: number;
}
export const MarqueeText = (p: MarqueeTextProps) => {
  const scaledStyle = useScale(p);
  return <_MarqueeText {...p} style={scaledStyle} />;
};
