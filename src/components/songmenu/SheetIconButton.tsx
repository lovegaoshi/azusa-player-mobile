import { View } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

interface IconButtonProps {
  onPress?: () => unknown;
  icon: string;
  buttonText?: string;
  children?: React.ReactNode;
}

export default ({
  icon,
  onPress = () => console.log('pressed!'),
  buttonText,
  children,
}: IconButtonProps) => {
  const { t } = useTranslation();
  return (
    <View
      style={{
        flex: 1,
        height: 120,
        alignItems: 'center',
      }}
    >
      <IconButton
        icon={icon}
        mode={'contained-tonal'}
        size={30}
        style={{ flex: 1, width: '90%' }}
        onPress={onPress}
      />
      {buttonText && <Text>{t(buttonText)}</Text>}
      {children}
    </View>
  );
};
