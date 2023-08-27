import { View, StyleSheet } from 'react-native';
import { useNoxSetting } from '@hooks/useSetting';
import { Text } from 'react-native-paper';

interface Props {
  title?: string;
  children: JSX.Element;
}

export default (props: Props) => {
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
};

const styles = StyleSheet.create({
  spacer: {
    height: 10,
  },
});
