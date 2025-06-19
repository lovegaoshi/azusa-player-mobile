import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { RefObject, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PaperText as Text } from '@components/commonui/ScaledText';
import { NoxSheetRoutes } from '@enums/Routes';
import { useNoxSetting } from '@stores/useApp';
import { useTrackStore } from '@hooks/useActiveTrack';
import SheetIconEntry from '@components/commonui/bottomsheet/SheetIconEntry';
import NoxBottomSheet from '@components/commonui/bottomsheet/NoxBottomSheet';

enum Routes {
  Main = 'main',
  LyricSearch = 'lyric',
}

interface IMain {
  showLyricOffsetModal: () => void;
  setRoute: (route: Routes) => void;
  sheet: RefObject<TrueSheet | null>;
}
const Main = ({ sheet, setRoute, showLyricOffsetModal }: IMain) => {
  const { t } = useTranslation();
  return (
    <View>
      <SheetIconEntry
        text={t('Lyric.changeLyric')}
        icon={'text-search'}
        onPress={() => setRoute(Routes.LyricSearch)}
      />
      <SheetIconEntry
        text={t('Lyric.offset')}
        icon={'tune-variant'}
        onPress={() => {
          showLyricOffsetModal();
          sheet.current?.dismiss();
        }}
      />
    </View>
  );
};

interface UseLyric {
  lrcOptions: NoxLyric.NoxFetchedLyric[];
  searchText: string;
  setSearchText: (text: string) => void;
  searchAndSetCurrentLyric: (p: { index: number }) => unknown;
  fetchAndSetLyricOptions: (s?: string) => unknown;
}

interface ILyricSearch {
  usedLyric: UseLyric;
}
const LyricSearch = ({ usedLyric }: ILyricSearch) => {
  const {
    searchAndSetCurrentLyric,
    fetchAndSetLyricOptions,
    lrcOptions,
    searchText,
    setSearchText,
  } = usedLyric;
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const track = useTrackStore(s => s.track);

  return (
    <>
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
      {lrcOptions.map((item, index) => (
        <TouchableOpacity
          onPress={() => searchAndSetCurrentLyric({ index })}
          key={item.key}
        >
          <Text
            style={[styles.listItem, { color: playerStyle.colors.secondary }]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
      <View style={{ height: 120 }} />
    </>
  );
};

interface Props {
  usedLyric: UseLyric;
  showLyricOffsetModal: () => void;
}

export default ({ showLyricOffsetModal, usedLyric }: Props) => {
  const sheet = useRef<TrueSheet>(null);
  const [route, setRoute] = useState(Routes.Main);
  const { t } = useTranslation();

  return (
    <NoxBottomSheet
      sizes={['auto', '50%']}
      name={NoxSheetRoutes.LyricSheet}
      ref={sheet}
      onDismiss={() => setRoute(Routes.Main)}
      Header={() =>
        route === Routes.Main ? (
          <View style={{ paddingVertical: 15, alignItems: 'center' }}>
            <Text variant="titleLarge">{t('Lyric.options')}</Text>
          </View>
        ) : (
          <View style={{ paddingVertical: 15, alignItems: 'center' }}>
            <Text variant="titleLarge">{t('Lyric.Search')}</Text>
          </View>
        )
      }
    >
      {route === Routes.Main ? (
        <Main
          sheet={sheet}
          setRoute={setRoute}
          showLyricOffsetModal={showLyricOffsetModal}
        />
      ) : (
        <LyricSearch usedLyric={usedLyric} />
      )}
    </NoxBottomSheet>
  );
};

const styles = StyleSheet.create({
  listItem: {
    padding: 10,
    fontSize: 16,
    borderTopColor: 'grey',
  },
  searchBar: {
    height: 40,
    paddingLeft: 15,
    backgroundColor: '#f0f0f0',
    fontSize: 16,
    color: '#333',
  },
});
