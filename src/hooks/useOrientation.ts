import { useWindowDimensions } from 'react-native';
export function useIsLandscape() {
  const { height, width } = useWindowDimensions();
  return width > height;
}
