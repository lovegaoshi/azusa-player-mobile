import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNoxSetting } from '@stores/useApp';

import { PaperText as Text } from '@components/commonui/ScaledText';

interface Props {
  title?: string;
  children: React.JSX.Element;
}

export default function GroupView(props: Props) {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <View
      style={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
      }}
    >
      <View style={styles.spacer}></View>
      {props.title && (
        <Text style={{ color: playerStyle.colors.primary }}>{props.title}</Text>
      )}
      {props.children}
      <View></View>
    </View>
  );
}

const styles = StyleSheet.create({
  spacer: {
    height: 10,
  },
});
