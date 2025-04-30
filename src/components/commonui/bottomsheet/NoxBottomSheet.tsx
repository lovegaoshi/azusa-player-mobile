import { SheetSize, TrueSheet } from '@lodev09/react-native-true-sheet';
import { MutableRefObject, RefObject, useRef } from 'react';
import { Text, View, Alert, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';

interface Props {
  name: string;
  ref: RefObject<TrueSheet>;
  cornerRadius?: number;
  sizes?: SheetSize[];
  children?: React.ReactNode;
}

export default ({
  name,
  ref,
  cornerRadius = 5,
  children,
  sizes = ['auto', 'large'],
}: Props) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <TrueSheet
      name={name}
      ref={ref}
      backgroundColor={playerStyle.colors.surfaceVariant}
      sizes={sizes}
      cornerRadius={cornerRadius}
    >
      <ScrollView>
        {children}
        <View style={{ paddingBottom: 10 }} />
      </ScrollView>
    </TrueSheet>
  );
};
