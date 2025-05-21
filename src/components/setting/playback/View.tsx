import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';

import SelectDialogWrapper, {
  SelectDialogChildren,
} from '../SelectDialogWrapper';
import { useNoxSetting } from '@stores/useApp';
import { saveFadeInterval } from '@utils/ChromeStorage';
import { isAndroid, selfDestruct } from '@utils/RNUtils';
import { SelectSettingEntry, SettingEntry } from '../helpers/SettingEntry';
import SettingListItem from '../helpers/SettingListItem';
import appStore from '@stores/appStore';
import EqualizerButton from '../equalizer/EQButton';
import { RenderSetting } from '../helpers/RenderSetting';

const FadeOptions = [0, 250, 500, 1000];
const CrossFadeOptions = [0, 2500, 5000, 7500, 12000];
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
  /**
  chatGPTSongName: {
    settingName: 'chatGPTResolveSongName',
    settingCategory: 'GeneralSettings',
  },
   */
};
enum Icons {
  crossfade = 'shuffle-variant',
  fade = 'cosine-wave',
}

const Home = ({
  setCurrentSelectOption,
  setSelectVisible,
}: SelectDialogChildren<any>) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
  const { t } = useTranslation();
  const fadeIntervalMs = useStore(appStore, state => state.fadeIntervalMs);

  const selectFade = () => {
    setSelectVisible(true);
    setCurrentSelectOption({
      options: FadeOptions,
      renderOption: (option: number) => String(option),
      defaultIndex: 0,
      onClose: () => setSelectVisible(false),
      onSubmit: (index: number) => {
        saveFadeInterval(FadeOptions[index]).then(selfDestruct);
        setSelectVisible(false);
      },
      title: t('DeveloperSettings.FadeTitle'),
    } as SelectSettingEntry<number>);
  };

  const selectCrossFade = () => {
    setSelectVisible(true);
    setCurrentSelectOption({
      options: CrossFadeOptions,
      renderOption: (option: number) => String(option),
      defaultIndex: 0,
      onClose: () => setSelectVisible(false),
      onSubmit: (index: number) => {
        setPlayerSetting({ crossfade: CrossFadeOptions[index] / 1000 }).then(
          selfDestruct,
        );
        setSelectVisible(false);
      },
      title: t('DeveloperSettings.crossfadeTitle'),
    } as SelectSettingEntry<number>);
  };

  return (
    <ScrollView>
      <RenderSetting item={renderSettings.r128gain} />
      <RenderSetting item={renderSettings.noBiliR128Gain} />
      <RenderSetting item={renderSettings.noInterruption} />
      {isAndroid && <RenderSetting item={renderSettings.prefetchTrack} />}
      {isAndroid && <RenderSetting item={renderSettings.audioOffload} />}
      {isAndroid && <RenderSetting item={renderSettings.skipSilence} />}
      {isAndroid && <RenderSetting item={renderSettings.pausePlaybackOnMute} />}
      {isAndroid && <EqualizerButton />}
      <SettingListItem
        icon={Icons.fade}
        settingName="Fade"
        onPress={selectFade}
        settingCategory="DeveloperSettings"
        modifyDescription={val => `${val}: ${fadeIntervalMs}ms`}
      />
      {isAndroid && (
        <SettingListItem
          icon={Icons.crossfade}
          settingName="crossfade"
          onPress={selectCrossFade}
          settingCategory="DeveloperSettings"
          modifyDescription={v => `${v}: ${playerSetting.crossfade * 1000}ms`}
        />
      )}
    </ScrollView>
  );
};

export default () => {
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
};
