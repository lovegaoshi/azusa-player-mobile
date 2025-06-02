import React, { useEffect, useRef, useState } from 'react';
import { Searchbar } from 'react-native-paper';
import {
  View,
  Pressable,
  StyleSheet,
  Animated,
  GestureResponderEvent,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import SearchMenu from './PlaylistSearchMenu';
import { useNoxSetting } from '@stores/useApp';
import { seconds2HHMMSS } from '@utils/Utils';
import { PaperText as Text } from '@components/commonui/ScaledText';

interface UsePlaylist {
  searchText: string;
  setSearchText: (val: string) => void;
  searching: boolean;
  selected: boolean[];
  checking: boolean;
}

interface Props {
  usePlaylist: UsePlaylist;
  onPressed?: () => void;
}

export default ({ usePlaylist, onPressed = () => undefined }: Props) => {
  const { searchText, setSearchText, searching, selected, checking } =
    usePlaylist;
  const { t } = useTranslation();
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchContainerRef = useRef<any>(null);
  const opacity = useRef(new Animated.Value(1)).current;
  const searchBkgrdWidth = useRef(new Animated.Value(0)).current;
  const searchBkgrdHeight = useRef(new Animated.Value(0)).current;
  const [searchVisible, setSearchVisible] = useState(searching);
  // TODO: a more elegant way to signal content update
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _playlistInfoUpdate = useNoxSetting(state => state.playlistInfoUpdate);
  const playlistSearchAutoFocus: boolean = useNoxSetting(
    state => state.playlistSearchAutoFocus,
  );
  const setPlaylistSearchAutoFocus = useNoxSetting(
    state => state.setPlaylistSearchAutoFocus,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<NoxTheme.Coordinates>({
    x: 0,
    y: 0,
  });
  const [headerHeight, setHeaderHeight] = useState<number>();

  const handleMenuPress = (event: GestureResponderEvent) => {
    toggleVisible();
    setMenuCoords({
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    });
  };

  const toggleVisible = () => {
    setDialogOpen(val => !val);
  };

  const renderSongCount = () => {
    if (checking) {
      const selectedLength = selected.filter(val => val === true).length;
      if (selectedLength !== 0) {
        return selectedLength;
      }
    }
    return currentPlaylist?.songList?.length ?? 0;
  };

  const renderSongDuration = () => {
    if (checking) {
      const selectedLength = selected.filter(val => val === true).length;
      if (selectedLength !== 0) {
        const selectedDuration = currentPlaylist.songList
          .filter((val, index) => selected[index])
          .reduce(
            (accumulator, currentValue) => accumulator + currentValue.duration,
            0,
          );
        return seconds2HHMMSS(selectedDuration);
      }
    }
    return seconds2HHMMSS(
      currentPlaylist?.songList?.reduce(
        (accumulator, currentValue) => accumulator + currentValue.duration,
        0,
      ) ?? 0,
    );
  };

  useEffect(() => {
    setSearchText('');
  }, [currentPlaylist]);

  useEffect(() => {
    setSearchVisible(true);
    if (searching) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.timing(searchBkgrdWidth, {
        toValue: 100,
        duration: 280,
        useNativeDriver: false,
      }).start(() => {
        if (playlistSearchAutoFocus) {
          searchContainerRef.current?.focus();
          Animated.timing(searchBkgrdHeight, {
            toValue: 50,
            duration: 180,
            useNativeDriver: false,
          }).start();
        }
        setPlaylistSearchAutoFocus(true);
      });
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(searchBkgrdWidth, {
          toValue: 0,
          duration: 180,
          useNativeDriver: false,
        }),
        Animated.timing(searchBkgrdHeight, {
          toValue: 0,
          duration: 180,
          useNativeDriver: false,
        }),
      ]).start(() => setSearchVisible(false));
    }
  }, [searching]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          {
            width: searchBkgrdWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            height: headerHeight,
          },
          { zIndex: 2 },
        ]}
      >
        {searchVisible && (
          <Searchbar
            placeholder={t('PlaylistSearchBar.label')}
            value={searchText}
            onChangeText={(val: string) => {
              setSearchText(val);
            }}
            style={styles.textInput}
            inputStyle={styles.searchInput}
            ref={searchContainerRef}
            // HACK: breaks on newarch
            //selectTextOnFocus
            selectionColor={playerStyle.customColors.textInputSelectionColor}
            icon={searching ? 'format-list-checkbox' : () => undefined}
            onIconPress={handleMenuPress}
          />
        )}
      </Animated.View>

      <Animated.View
        style={[styles.pressable, { opacity }]}
        onLayout={e =>
          !headerHeight && setHeaderHeight(e.nativeEvent.layout.height)
        }
      >
        <Pressable onPress={onPressed}>
          <Text numberOfLines={1} variant="titleMedium">
            {currentPlaylist?.title}
          </Text>
          <Text
            numberOfLines={1}
            variant="labelMedium"
          >{`${renderSongCount()} / ${renderSongDuration()}`}</Text>
        </Pressable>
      </Animated.View>
      <SearchMenu
        visible={dialogOpen}
        toggleVisible={toggleVisible}
        menuCoords={menuCoords}
        setSearchCategory={setSearchText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 15,
    paddingLeft: 10,
  },
  textInput: {
    zIndex: 15,
  },
  searchInput: {
    marginTop: -6,
  },
  pressable: {
    position: 'absolute',
    paddingLeft: 15,
    zIndex: 1,
  },
});
