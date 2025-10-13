import React from 'react';
import { Icon } from 'react-native-paper';

import { useNoxSetting } from '@stores/useApp';
import ShadowedElement from '@components/buttons/ShadowedElement';
import { Pressable, ViewStyle } from 'react-native';

interface Props {
  iconSize?: number;
  onPress: () => void;
  icon: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}
export default function ShadowedButton({
  iconSize = 30,
  onPress = () => undefined,
  icon,
  style,
  accessibilityLabel,
}: Props) {
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
        accessibilityLabel={accessibilityLabel}
      >
        <Icon
          source={icon}
          size={iconSize}
          color={playerStyle.colors.primary}
        />
      </Pressable>
    </ShadowedElement>
  );
}
