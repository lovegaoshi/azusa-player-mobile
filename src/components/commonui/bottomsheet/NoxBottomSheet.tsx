import { SheetSize, TrueSheet } from '@lodev09/react-native-true-sheet';
import { RefObject } from 'react';
import { View, ScrollView } from 'react-native';
import { useNoxSetting } from '@stores/useApp';

interface Props {
  name: string;
  ref: RefObject<TrueSheet | null>;
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
