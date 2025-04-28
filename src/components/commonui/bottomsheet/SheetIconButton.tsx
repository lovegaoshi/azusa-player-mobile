import { View } from 'react-native';
import { Text, IconButton } from 'react-native-paper';

import { useNoxSetting } from '@stores/useApp';

interface IconButtonProps {
  onPress?: () => unknown;
  icon: string;
  buttonText?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export default ({
  icon,
  onPress = () => console.log('pressed!'),
  buttonText,
  children,
  disabled,
}: IconButtonProps) => {
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
      {buttonText && <Text>{buttonText}</Text>}
      {children}
    </View>
  );
};
