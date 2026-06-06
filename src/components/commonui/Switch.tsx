import { Host, Switch as MD3Switch } from '@expo/ui/jetpack-compose';
import { Switch } from 'react-native-paper';

import { useNoxSetting } from '@stores/useApp';
import { isAndroid } from '@utils/RNUtils';
import { TextStyle, View, ViewStyle } from 'react-native';
import { PaperText as Text } from './ScaledText';

interface Props {
  value: boolean;
  onValueChange: (v: boolean) => void;
  color?: string;
}

interface LabeledProps extends Props {
  viewStyle: ViewStyle;
  textStyle: TextStyle;
  text: string;
}

export default function MySwitch(p: Props) {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const playerStyle = useNoxSetting(state => state.playerStyle);

  if (isAndroid && playerSetting.md3slider) {
    return (
      <Host matchContents style={style}>
        <MD3Switch
          {...p}
          colors={{ checkedTrackColor: p.color ?? playerStyle.colors.primary }}
          onCheckedChange={p.onValueChange}
        />
      </Host>
    );
  }
  return <Switch {...p} />;
}

export const LabeledSwitch = ({
  viewStyle,
  textStyle,
  text,
  value,
  onValueChange,
  color,
}: LabeledProps) => {
  return (
    <View style={viewStyle}>
      <MySwitch value={value} onValueChange={onValueChange} color={color} />
      <Text style={textStyle}>{text}</Text>
    </View>
  );
};

const style = {
  marginHorizontal: 4,
};
