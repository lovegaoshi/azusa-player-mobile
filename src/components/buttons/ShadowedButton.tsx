import React from 'react';
import { Icon } from 'react-native-paper';

import { useNoxSetting } from '@hooks/useSetting';
import ShadowedElement from '@components/buttons/ShadowedElement';
import { Pressable, ViewStyle } from 'react-native';

interface Props {
  iconSize?: number;
  onPress: () => void;
  icon: string;
  style?: ViewStyle;
}
export default ({
  iconSize = 30,
  onPress = () => undefined,
  icon,
  style,
}: Props) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const size = iconSize;

  return (
    <ShadowedElement
      style={{
        backgroundColor: playerStyle.customColors.btnBackgroundColor,
        width: size + 15,
        height: size + 15,
        borderRadius: size / 2 + 8,
        marginLeft: 0,
        ...style,
      }}
    >
      <Pressable
        onPress={onPress}
        style={{
          marginLeft: 8,
          marginTop: 8,
        }}
      >
        <Icon
          source={icon}
          size={iconSize}
          color={playerStyle.colors.primary}
        />
      </Pressable>
    </ShadowedElement>
  );
};
