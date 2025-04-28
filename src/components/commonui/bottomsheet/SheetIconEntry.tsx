import { View } from 'react-native';
import { IconButton, Text, TouchableRipple } from 'react-native-paper';

interface Props {
  icon: string;
  text: string;
  onPress?: () => void;
}
export default ({ icon, text, onPress }: Props) => {
  return (
    <TouchableRipple onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <IconButton icon={icon} size={32} />
        <Text> {text} </Text>
      </View>
    </TouchableRipple>
  );
};
