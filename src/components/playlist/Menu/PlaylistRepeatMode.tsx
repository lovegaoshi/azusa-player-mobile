import { Pressable, StyleSheet, View } from 'react-native';
import { useStore } from 'zustand';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';
import { NoxRepeatMode } from '@enums/RepeatMode';
import { styles } from '@components/style';
import { Icon, Text } from 'react-native-paper';
import noxPlayingList from '@stores/playingList';

interface Props {
  mode?: NoxRepeatMode;
  onPress: (v: NoxRepeatMode) => void;
}

export default ({ mode, onPress }: Props) => {
  const { t } = useTranslation();
  const playMode = useStore(noxPlayingList, state => state.playmode);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const actualMode = mode ?? playMode;

  const nextPlaymode = () => {
    switch (actualMode) {
      case NoxRepeatMode.Repeat:
        return NoxRepeatMode.RepeatTrack;
      case NoxRepeatMode.RepeatTrack:
        return NoxRepeatMode.Shuffle;
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
          source={actualMode}
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
