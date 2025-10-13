import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';

import { PaperText as Text } from '@components/commonui/ScaledText';
import { useNoxSetting } from '@stores/useApp';

export interface Props {
  onPress?: () => unknown;
  icon: string;
  text?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export default function SheetIconButton({
  icon,
  onPress = () => console.log('pressed!'),
  text,
  children,
  disabled,
}: Props) {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <View style={styles.view}>
      <IconButton
        disabled={disabled}
        icon={icon}
        mode={'contained-tonal'}
        size={30}
        style={styles.button}
        onPress={onPress}
        containerColor={playerStyle.colors.surface}
      />
      {text && <Text style={disabled && styles.disabledText}>{text}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    height: 110,
    alignItems: 'center',
  },
  button: { flex: 1, width: '90%' },
  disabledText: {
    color: 'gray',
  },
});
