import { View } from 'react-native';
import { Text, IconButton } from 'react-native-paper';

import { useNoxSetting } from '@stores/useApp';

export interface Props {
  onPress?: () => unknown;
  icon: string;
  text?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export default ({
  icon,
  onPress = () => console.log('pressed!'),
  text,
  children,
  disabled,
}: Props) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <View
      style={{
        flex: 1,
        height: 110,
        alignItems: 'center',
      }}
    >
      <IconButton
        disabled={disabled}
        icon={icon}
        mode={'contained-tonal'}
        size={30}
        style={{ flex: 1, width: '90%' }}
        onPress={onPress}
        containerColor={playerStyle.colors.surface}
      />
      {text && <Text>{text}</Text>}
      {children}
    </View>
  );
};
