import { ScrollView, View } from 'react-native';

import SelectDialogWrapper, {
  SelectDialogChildren,
} from '../SelectDialogWrapper';
import { useNoxSetting } from '@stores/useApp';
import { isAndroid } from '@utils/RNUtils';
import { SettingEntry } from '../helpers/SettingEntry';
import EqualizerButton from '../equalizer/EQButton';
import { RenderSetting } from '../helpers/RenderSetting';
import CrossfadeButton from './CrossfadeButton';
import FadeButton from './FadeButton';

const renderSettings: { [key: string]: SettingEntry } = {
  noInterruption: {
    settingName: 'noInterruption',
    settingCategory: 'DeveloperSettings',
  },
  prefetchTrack: {
    settingName: 'prefetchTrack',
    settingCategory: 'GeneralSettings',
  },
  audioOffload: {
    settingName: 'audioOffload',
    settingCategory: 'GeneralSettings',
  },
  skipSilence: {
    settingName: 'skipSilence',
    settingCategory: 'GeneralSettings',
  },
  noxSkipSilence: {
    settingName: 'noxSkipSilence',
    settingCategory: 'GeneralSettings',
  },
  r128gain: {
    settingName: 'r128gain',
    settingCategory: 'GeneralSettings',
  },
  pausePlaybackOnMute: {
    settingName: 'pausePlaybackOnMute',
    settingCategory: 'GeneralSettings',
  },
  noBiliR128Gain: {
    settingName: 'noBiliR128Gain',
    settingCategory: 'GeneralSettings',
  },
  beatMatchCrossfade: {
    settingName: 'beatMatchCrossfade',
    settingCategory: 'GeneralSettings',
  },
  /**
  chatGPTSongName: {
    settingName: 'chatGPTResolveSongName',
    settingCategory: 'GeneralSettings',
  },
   */
};

const Home = ({
  setCurrentSelectOption,
  setSelectVisible,
}: SelectDialogChildren<any>) => {
  return (
    <ScrollView>
      <RenderSetting item={renderSettings.r128gain} />
      <RenderSetting item={renderSettings.noBiliR128Gain} />
      <RenderSetting item={renderSettings.noInterruption} />
      {isAndroid && <RenderSetting item={renderSettings.prefetchTrack} />}
      {isAndroid && <RenderSetting item={renderSettings.audioOffload} />}
      <RenderSetting item={renderSettings.noxSkipSilence} />
      {isAndroid && <RenderSetting item={renderSettings.skipSilence} />}
      {isAndroid && <RenderSetting item={renderSettings.pausePlaybackOnMute} />}
      {isAndroid && <EqualizerButton />}
      <FadeButton
        setCurrentSelectOption={setCurrentSelectOption}
        setSelectVisible={setSelectVisible}
      />
      <CrossfadeButton
        setCurrentSelectOption={setCurrentSelectOption}
        setSelectVisible={setSelectVisible}
      />
      {isAndroid && <RenderSetting item={renderSettings.beatMatchCrossfade} />}
    </ScrollView>
  );
};

export default function SettingPlaybackView() {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  return (
    <View
      style={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        flex: 1,
      }}
    >
      <SelectDialogWrapper Children={p => <Home {...p} />} />
    </View>
  );
}
