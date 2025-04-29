import { StyleSheet, View } from 'react-native';
import { IconButton, Text, TouchableRipple } from 'react-native-paper';

import { Props } from './SheetIconButton';

export default ({ icon, text, onPress, disabled, children }: Props) => {
  return (
    <View>
      <TouchableRipple onPress={onPress} disabled={disabled}>
        <View style={styles.view}>
          <IconButton icon={icon} size={32} disabled={disabled} />
          <Text style={disabled && styles.disabledText}> {text} </Text>
        </View>
      </TouchableRipple>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledText: {
    color: 'gray',
  },
});
