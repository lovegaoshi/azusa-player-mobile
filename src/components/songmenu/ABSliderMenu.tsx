import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { RangeSlider } from '@react-native-assets/slider';
import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';

import { PaperText as Text } from '@components/commonui/ScaledText';
import { useNoxSetting } from '@stores/useApp';
import GenericDialog from '@components/dialogs/GenericDialog';
import { seconds2MMSS as formatSeconds } from '@utils/Utils';
import { setABRepeat } from '@utils/db/sqlStorage';
import SheetIconEntry from '@components/commonui/bottomsheet/SheetIconEntry';
import NoxCache from '@utils/Cache';
import { setNoxSkipSilence } from '@utils/ffmpeg/skipSilence';
import ReanimatedSpinButton from '@components/commonui/ReanimatedSpinButton';

interface Props {
  song: NoxMedia.Song;
  showSheet?: (v: boolean) => void;
}

interface SliderProps {
  range: [number, number];
  setRange: (range: [number, number]) => void;
}

const ABSlider = ({ range, setRange }: SliderProps) => {
  const { duration } = useProgress(1000, false);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentABRepeat = useNoxSetting(state => state.currentABRepeat);
  const parsedRange = currentABRepeat.slice(0, 2) as [number, number];
  useEffect(() => setRange(parsedRange), [currentABRepeat]);
  console.log('parsedRange', parsedRange);

  return (
    <View>
      <View style={styles.labelSpacer} />
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>
          {formatSeconds(duration * range[0])}
        </Text>
        <Text style={styles.labelText}>
          {formatSeconds(duration * range[1])}
        </Text>
      </View>
      <View style={styles.labelSpacer} />
      <RangeSlider
        thumbStyle={{ elevation: 0 }}
        range={parsedRange}
        thumbTintColor={playerStyle.colors.tertiary}
        onValueChange={setRange}
        outboundColor={playerStyle.colors.secondaryContainer}
        inboundColor={playerStyle.colors.primary}
        maximumValue={1}
      />
    </View>
  );
};

const ABSliderMenu = ({ song, showSheet }: Props) => {
  const { t } = useTranslation();
  const [dialogVisible, setDialogVisible] = useState(false);
  const setCurrentABRepeat = useNoxSetting(state => state.setCurrentABRepeat);
  const [range, setRange] = useState<[number, number]>([0, 1]);

  const onSubmit = async () => {
    setDialogVisible(val => !val);
    setCurrentABRepeat(range);
    const duration = (await TrackPlayer.getProgress()).duration;
    await setABRepeat(song.id, {
      a: range[0],
      b: range[1],
      aAbs: range[0] * duration,
      bAbs: range[1] * duration,
    });
  };

  const showDialog = () => {
    setDialogVisible(true);
    showSheet?.(false);
  };

  const dismissDialog = () => {
    setDialogVisible(val => !val);
    showSheet?.(true);
  };

  const onNoxSkipSilencePress = async (toggleSpin: () => void) => {
    toggleSpin();
    try {
      const cachedUrl = await NoxCache.noxMediaCache?.loadCacheMedia(song);
      if (cachedUrl) {
        // TODO: make this spin while running
        await setNoxSkipSilence({ path: cachedUrl, song, forced: true });
      }
    } finally {
      toggleSpin();
    }
  };

  return (
    <SheetIconEntry
      text={t('SongOperations.abrepeat')}
      icon={'ab-testing'}
      onPress={showDialog}
    >
      <GenericDialog
        visible={dialogVisible}
        title={t('SongOperations.abrepeat')}
        onClose={dismissDialog}
        onSubmit={onSubmit}
      >
        <View>
          <View style={{ alignItems: 'flex-end' }}>
            <ReanimatedSpinButton onPress={onNoxSkipSilencePress}>
              <IconButton icon={'sync'} size={30} />
            </ReanimatedSpinButton>
          </View>
          <ABSlider range={range} setRange={setRange} />
        </View>
      </GenericDialog>
    </SheetIconEntry>
  );
};

export default ABSliderMenu;

const styles = StyleSheet.create({
  liveContainer: {
    height: 100,
    alignItems: 'center',
    flexDirection: 'row',
  },
  liveText: {
    color: 'white',
    alignSelf: 'center',
    fontSize: 18,
  },
  container: {
    width: '100%',
    marginTop: 10,
    flexDirection: 'row',
    paddingHorizontal: 15,
  },
  labelContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  labelSpacer: {
    height: 10,
  },
  labelText: {
    fontVariant: ['tabular-nums'],
  },
});
