import { View } from 'react-native';
import { IconButton, Text, TouchableRipple } from 'react-native-paper';
import { Props } from './SheetIconButton';

export default ({ icon, text, onPress, disabled, children }: Props) => {
  return (
    <View>
      <TouchableRipple onPress={onPress} disabled={disabled}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icon={icon} size={32} />
          <Text> {text} </Text>
        </View>
      </TouchableRipple>
      {children}
    </View>
  );
};
