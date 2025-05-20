import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';
import { NoxRepeatMode } from '@enums/RepeatMode';
import { styles } from '@components/style';
import { Icon, Text } from 'react-native-paper';

interface Props {
  mode?: NoxRepeatMode;
  onPress: (v?: NoxRepeatMode) => void;
}

export default ({ mode, onPress }: Props) => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);

  const nextPlaymode = () => {
    switch (mode) {
      case NoxRepeatMode.Repeat:
        return NoxRepeatMode.RepeatTrack;
      case NoxRepeatMode.RepeatTrack:
        return undefined;
      case NoxRepeatMode.Shuffle:
        return NoxRepeatMode.Repeat;
      default:
        return NoxRepeatMode.Shuffle;
    }
  };

  return (
    <View style={styles.rowView}>
      <Pressable
        onPress={() => onPress(nextPlaymode())}
        style={{ paddingHorizontal: 11 }}
      >
        <Icon
          source={mode ?? 'progress-question'}
          color={playerStyle.colors.primary}
          size={25}
        />
      </Pressable>
      <Text style={mStyles.switchText}>
        {t('PlaylistSettingsDialog.repeatMode')}
      </Text>
    </View>
  );
};

const mStyles = StyleSheet.create({
  switchContainer: {
    flexDirection: 'row',
  },
  switchText: {
    fontSize: 18,
  },
});
