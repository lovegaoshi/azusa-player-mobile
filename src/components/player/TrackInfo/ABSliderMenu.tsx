import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { Menu } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useProgress } from 'react-native-track-player';
import { RangeSlider } from '@sharcoux/slider';
import { StyleSheet, Text, View } from 'react-native';

import { useNoxSetting } from '@hooks/useSetting';
import GenericDialog from '@components/dialogs/GenericDialog';
import { seconds2MMSS as formatSeconds } from '@utils/Utils';
import { addABRepeat } from '@stores/appStore';

interface Props {
  song: NoxMedia.Song;
  closeMenu?: () => void;
}

interface ABSRef {
  range: [number, number];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ABSlider = React.forwardRef<ABSRef, Props>(({ song }: Props, ref) => {
  const { duration } = useProgress();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentABRepeat = useNoxSetting(state => state.currentABRepeat);
  const [range, setRange] = useState<[number, number]>([0, 1]);
  useImperativeHandle(ref, () => ({ range }), [range]);

  useEffect(() => setRange(currentABRepeat), [currentABRepeat]);

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
        range={currentABRepeat}
        thumbTintColor={
          playerStyle.progressThumbImage
            ? undefined
            : playerStyle.customColors.progressThumbTintColor
        }
        onValueChange={setRange}
        outboundColor={playerStyle.customColors.progressMaximumTrackTintColor}
        inboundColor={playerStyle.customColors.progressMinimumTrackTintColor}
      />
    </View>
  );
});

const ABSliderMenu = ({ song, closeMenu }: Props) => {
  const { t } = useTranslation();
  const [dialogVisible, setDialogVisible] = useState(false);
  const setCurrentABRepeat = useNoxSetting(state => state.setCurrentABRepeat);
  const ABSSliderRef = useRef<ABSRef>(null);

  const toggleDialogVisible = () => {
    if (closeMenu) closeMenu();
    setDialogVisible(val => !val);
  };

  const onSubmit = () => {
    toggleDialogVisible();
    if (ABSSliderRef.current) {
      setCurrentABRepeat(ABSSliderRef.current.range);
      addABRepeat(song, ABSSliderRef.current.range);
    }
  };

  return (
    <>
      <Menu.Item
        leadingIcon={'ab-testing'}
        title={t('SongOperations.abrepeat')}
        onPress={() => setDialogVisible(true)}
      />
      <GenericDialog
        visible={dialogVisible}
        title={String(t('SongOperations.abrepeat'))}
        onClose={toggleDialogVisible}
        onSubmit={onSubmit}
      >
        <ABSlider song={song} ref={ABSSliderRef} />
      </GenericDialog>
    </>
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
    height: 30,
  },
  labelText: {
    color: 'white',
    fontVariant: ['tabular-nums'],
  },
});
