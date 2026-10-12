import { Platform } from 'react-native';
import { Touchable, TouchableProps } from 'react-native-gesture-handler';

export default (p: TouchableProps) => (
  <Touchable
    {...Platform.select({
      android: { androidRipple: {} },
      default: { underlayColor: 'black', animationDuration: 0 },
    })}
    {...p}
  />
);
