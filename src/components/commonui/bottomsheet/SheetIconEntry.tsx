import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { RectButton } from 'react-native-gesture-handler';

import { Props } from './SheetIconButton';
import { PaperText as Text } from '@components/commonui/ScaledText';

export default function SheetIconEntry({
  icon,
  text,
  onPress,
  disabled,
  children,
}: Props) {
  return (
    <View>
      <RectButton onPress={disabled ? undefined : onPress}>
        <View style={styles.view}>
          <IconButton icon={icon} size={32} disabled={disabled} />
          <Text style={disabled && styles.disabledText}> {text} </Text>
        </View>
      </RectButton>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledText: {
    color: 'gray',
  },
});
