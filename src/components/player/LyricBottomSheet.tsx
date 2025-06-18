import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useRef, useState } from 'react';
import { View, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { PaperText as Text } from '@components/commonui/ScaledText';
import { NoxSheetRoutes } from '@enums/Routes';
import { useNoxSetting } from '@stores/useApp';
import { SongTitle, styles } from '../player/TrackInfo/TrackInfoTemplate';
import { useTrackStore } from '@hooks/useActiveTrack';
import SheetIconButton from '../commonui/bottomsheet/SheetIconButton';
import SheetIconEntry from '@components/commonui/bottomsheet/SheetIconEntry';
import NoxBottomSheet from '@components/commonui/bottomsheet/NoxBottomSheet';
import useSnack from '@stores/useSnack';

export default () => {
  const sheet = useRef<TrueSheet>(null);
  const { t } = useTranslation();
  const track = useTrackStore(s => s.track);

  return (
    <NoxBottomSheet name={NoxSheetRoutes.LyricSheet} ref={sheet}>
      <View style={{ paddingVertical: 15, alignItems: 'center' }}>
        <Text variant="titleLarge">{t('Lyric.options')}</Text>
      </View>
      <SheetIconEntry text={t('Lyric.changeLyric')} icon={'text-search'} />
      <SheetIconEntry text={t('Lyric.offset')} icon={'tune-variant'} />
    </NoxBottomSheet>
  );
};
