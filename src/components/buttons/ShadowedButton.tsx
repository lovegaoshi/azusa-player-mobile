import React from 'react';
import { Icon } from 'react-native-paper';

import { useNoxSetting } from '@hooks/useSetting';
import ShadowedElement from '@components/buttons/ShadowedElement';
import { Pressable } from 'react-native';

interface Props {
  iconSize?: number;
  onPress: () => void;
  icon: string;
}
export default ({ iconSize = 30, onPress = () => undefined, icon }: Props) => {
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
      }}
    >
      <Pressable
        onPress={onPress}
        style={{
          marginLeft: 8,
          marginTop: 8,
        }}
      >
        <Icon source={icon} size={iconSize} />
      </Pressable>
    </ShadowedElement>
  );
};
