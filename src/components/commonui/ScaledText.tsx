import { TextProps, Text as RNText } from 'react-native';
import { Text, TextProps as PaperTextProps } from 'react-native-paper';

interface PaperProps<T> extends PaperTextProps<T> {
  scale?: number;
}

export const PaperText = (p: PaperProps<never>) => {
  return <Text {...p} />;
};

interface NativeProps extends TextProps {
  scale?: number;
}

export const NativeText = (p: NativeProps) => {
  return <RNText {...p} />;
};
