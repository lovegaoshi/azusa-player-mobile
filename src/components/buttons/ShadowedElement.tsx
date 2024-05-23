import { Shadow } from "react-native-shadow-2";
import { colord } from "colord";
import { View, ViewStyle } from "react-native";

interface Props {
  children: React.JSX.Element;
  style?: ViewStyle;
  distance?: number;
}
const ShadowedElement = ({ children, style, distance = 8 }: Props) => {
  if (style?.backgroundColor) {
    const color = colord(String(style.backgroundColor));
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
