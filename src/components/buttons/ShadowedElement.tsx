import { Shadow } from 'react-native-shadow-2';
import { colord } from 'colord';
import { View, ViewStyle } from 'react-native';

interface Props {
  children: React.JSX.Element;
  style?: ViewStyle;
  distance?: number;
}
const ShadowedElement = ({ children, style, distance = 8 }: Props) => {
  if (style?.backgroundColor) {
    const color = colord(String(style.backgroundColor));
    // TODO: boxShadow looks like shit
    /*
    if (isAndroid) {
      return (
        <View
          style={{
            width: style.width,
            height: style.height,
            borderRadius: style.width! / 2,
            backgroundColor: style.backgroundColor,
            boxShadow: `0 0 0 ${distance} ${shadowColor}`,
          }}
        >
          {children}
        </View>
      );
    }
    */
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
