import { View } from 'react-native';
import { Text, IconButton } from 'react-native-paper';

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
      />
      {buttonText && <Text>{buttonText}</Text>}
      {children}
    </View>
  );
};
