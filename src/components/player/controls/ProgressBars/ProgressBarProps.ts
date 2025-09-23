import { ViewStyle } from 'react-native';

export interface ProgressBarContainerProps {
  onValueChange?: (value: number) => void;
}

export interface ProgressBarProps extends ProgressBarContainerProps {
  thumbSize?: number;
  progressThumbImage?: string;
  trackHeight?: number;
  style?: ViewStyle;
  trackStyle?: ViewStyle;
  enabled?: boolean;
  progressInterval?: number;
}
