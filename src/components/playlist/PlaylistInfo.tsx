import React, { useEffect, useRef, useState } from 'react';
import { Searchbar, Text, TextInput } from 'react-native-paper';
import { View, Pressable, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNoxSetting } from '@hooks/useSetting';
import { seconds2HHMMSS } from '@utils/Utils';

interface Props {
  searchText: string;
  setSearchText: (val: string) => void;
  search?: boolean;
  onPressed?: () => void;
  selected: boolean[];
  checking: boolean;
  updateCounter: number;
}

export default ({
  searchText,
  setSearchText,
  search = false,
  onPressed = () => undefined,
  selected,
  checking,
  updateCounter,
}: Props) => {
  const { t } = useTranslation();
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const searchBarWidth = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [searchVisible, setSearchVisible] = useState(search);

  const renderSongCount = () => {
    if (checking) {
      const selectedLength = selected.filter(val => val === true).length;
      if (selectedLength !== 0) {
        return selectedLength;
      }
    }
    return currentPlaylist.songList.length;
  };

  const renderSongDuration = () => {
    if (checking) {
      const selectedLength = selected.filter(val => val === true).length;
      if (selectedLength !== 0) {
        const selectedDuration = currentPlaylist.songList
          .filter((val, index) => selected[index])
          .reduce(
            (accumulator, currentValue) => accumulator + currentValue.duration,
            0
          );
        return seconds2HHMMSS(selectedDuration);
      }
    }
    return seconds2HHMMSS(
      currentPlaylist.songList.reduce(
        (accumulator, currentValue) => accumulator + currentValue.duration,
        0
      )
    );
  };

  useEffect(() => {
    setSearchText('');
  }, [currentPlaylist]);

  useEffect(() => {
    setSearchVisible(true);
    if (search) {
      Animated.parallel([
        Animated.timing(searchBarWidth, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(searchBarWidth, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start(() => setSearchVisible(false));
    }
  }, [search]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scaleX: searchBarWidth }] }}>
        {searchVisible && (
          <Searchbar
            placeholder={String(t('PlaylistSearchBar.label'))}
            value={searchText}
            onChangeText={(val: string) => {
              setSearchText(val);
            }}
            style={styles.textInput}
            inputStyle={styles.searchInput}
            autoFocus
            selectTextOnFocus
            selectionColor={playerStyle.customColors.textInputSelectionColor}
          />
        )}
      </Animated.View>

      <Animated.View style={[styles.pressable, { opacity }]}>
        <Pressable onPress={onPressed}>
          <Text variant="titleMedium">{currentPlaylist.title}</Text>
          <Text variant="labelMedium">{`${renderSongCount()} / ${renderSongDuration()}`}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 15,
    paddingLeft: 10,
  },
  textInput: {
    height: 45,
  },
  searchInput: {
    marginTop: -6,
  },
  pressable: {
    position: 'absolute',
    paddingLeft: 15,
    zIndex: -1,
    // Add any additional styles for the Pressable component here
  },
});
