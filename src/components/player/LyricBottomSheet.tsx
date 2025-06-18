import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { RefObject, useRef, useState } from 'react';
import {
  View,
  Alert,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Track } from 'react-native-track-player';

import { PaperText as Text } from '@components/commonui/ScaledText';
import { NoxSheetRoutes } from '@enums/Routes';
import { useNoxSetting } from '@stores/useApp';
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
  showLyricOffsetModal: () => void;
  setRoute: (route: Routes) => void;
  sheet: RefObject<TrueSheet | null>;
}
const Main = ({ sheet, setRoute, showLyricOffsetModal }: IMain) => {
  const { t } = useTranslation();
  return (
    <View>
      <View style={{ paddingVertical: 15, alignItems: 'center' }}>
        <Text variant="titleLarge">{t('Lyric.options')}</Text>
      </View>
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
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const track = useTrackStore(s => s.track);

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

interface Props extends ILyricSearch {
  showLyricOffsetModal: () => void;
}

export default ({ showLyricOffsetModal, usedLyric }: Props) => {
  const sheet = useRef<TrueSheet>(null);
  const { t } = useTranslation();
  const [route, setRoute] = useState(Routes.Main);

  const Content = () => {
    switch (route) {
      case Routes.LyricSearch:
        return <LyricSearch usedLyric={usedLyric} />;
      default:
        return (
          <Main
            sheet={sheet}
            setRoute={setRoute}
            showLyricOffsetModal={showLyricOffsetModal}
          />
        );
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
