import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { RefObject, useRef, useState } from 'react';
import { View, Alert, Button } from 'react-native';
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
import useLyric from '@hooks/useLyricRN';

enum Routes {
  Main = 'main',
  LyricSearch = 'lyric',
}

interface IMain {
  setRoute: (route: Routes) => void;
  sheet: RefObject<TrueSheet | null>;
}
const Main = ({ setRoute }: IMain) => {
  const { t } = useTranslation();
  return (
    <View>
      <View style={{ paddingVertical: 15, alignItems: 'center' }}>
        <Text variant="titleLarge">{t('Lyric.options')}</Text>
      </View>
      <SheetIconEntry
        text={t('Lyric.changeLyric')}
        icon={'text-search'}
        onPress={() => console.log('[pressed!')}
      />
      <SheetIconEntry
        text={t('Lyric.offset')}
        icon={'tune-variant'}
        onPress={() => console.log('[pressed!')}
      />
    </View>
  );
};

const LyricSearch = () => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  return (
    <View>
      <View style={{ paddingVertical: 15, alignItems: 'center' }}>
        <Text variant="titleLarge">{t('歌词搜索')}</Text>
      </View>
      <TextInput
        style={[
          styles.searchBar,
          {
            backgroundColor: playerStyle.colors.primaryContainer,
            color: playerStyle.colors.primary,
          },
        ]}
        value={searchText}
        onChangeText={setSearchText}
        placeholder={track?.title ?? ''}
        onSubmitEditing={() => fetchAndSetLyricOptions(searchText)}
        selectionColor={playerStyle.customColors.textInputSelectionColor}
      />
      <FlatList
        style={{ backgroundColor: playerStyle.colors.primaryContainer }}
        data={lrcOptions}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => searchAndSetCurrentLyric({ index })}>
            <Text
              style={[styles.listItem, { color: playerStyle.colors.secondary }]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.key}
      />
    </View>
  );
};

export default () => {
  const sheet = useRef<TrueSheet>(null);
  const { t } = useTranslation();
  const [route, setRoute] = useState(Routes.Main);
  const track = useTrackStore(s => s.track);

  const Content = () => {
    switch (route) {
      default:
        return <Main sheet={sheet} setRoute={setRoute} />;
    }
  };

  return (
    <NoxBottomSheet
      name={NoxSheetRoutes.LyricSheet}
      ref={sheet}
      onDismiss={() => setRoute(Routes.Main)}
    >
      <Content />
    </NoxBottomSheet>
  );
};
