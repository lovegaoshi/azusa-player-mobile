import { Shadow } from 'react-native-shadow-2';
import { colord } from 'colord';
import { View, ViewStyle } from 'react-native';

import { isAndroid } from '@utils/RNUtils';

interface Props {
  children: React.JSX.Element;
  style?: ViewStyle;
  distance?: number;
}
const ShadowedElement = ({ children, style, distance = 8 }: Props) => {
  if (style?.backgroundColor) {
    const color = colord(String(style.backgroundColor));
    const shadowColor = color.alpha(color.alpha() * 0.75).toRgbString();
    if (isAndroid) {
      return (
        <View style={{ boxShadow: `0 0 0 ${distance}px ${shadowColor}` }}>
          {children}
        </View>
      );
    }
    // TODO: deprecate when ios upgrades to newarch too. remove shadow-2
    return (
      <Shadow
        distance={distance}
        startColor={color.alpha(color.alpha() * 0.75).toRgbString()}
      >
        <View style={style}>{children}</View>
      </Shadow>
    );
  }

  return <View style={style}>{children}</View>;
};

export default ShadowedElement;
