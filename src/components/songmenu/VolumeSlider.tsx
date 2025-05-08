import { View } from 'react-native';
import { IconButton } from 'react-native-paper';
import TrackPlayer from 'react-native-track-player';

import RNGHSlider, { SliderProps } from '../commonui/RNGHSlider';
import { useNoxSetting } from '@stores/useApp';

export default ({ onValueStart, onValueEnd }: SliderProps) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);

  return (
    <View
      style={{
        paddingTop: 15,
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
      }}
    >
      <View>
        <IconButton
          size={40}
          icon={'volume-plus'}
          onPress={() => {
            TrackPlayer.setLoudnessEnhance(0);
            setPlayerSetting({ loudnessEnhance: 0 });
          }}
        />
      </View>
      <RNGHSlider
        min={-5000}
        max={5000}
        defaultValue={playerSetting.loudnessEnhance}
        sliderBackgroundColor={playerStyle.colors.surface}
        sliderForegroundColor={playerStyle.colors.primary}
        onValueStart={onValueStart}
        onValueChange={TrackPlayer.setLoudnessEnhance}
        onValueEnd={v => {
          setPlayerSetting({
            loudnessEnhance: v,
          });
          onValueEnd?.(v);
        }}
      />
      <View style={{ width: 20 }} />
    </View>
  );
};
