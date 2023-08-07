import React, { useEffect } from 'react';
import { Searchbar, Text, TextInput } from 'react-native-paper';
import { View, Pressable, StyleSheet } from 'react-native';
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

  useEffect(() => console.log(updateCounter), [updateCounter]);

  return (
    <View style={styles.container}>
      {search ? (
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
      ) : (
        <Pressable onPress={onPressed} style={styles.pressable}>
          <Text variant="titleMedium">{currentPlaylist.title}</Text>
          <Text variant="labelMedium">{`${renderSongCount()} / ${renderSongDuration()}`}</Text>
        </Pressable>
      )}
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
    // Add any additional styles for the Pressable component here
  },
});
