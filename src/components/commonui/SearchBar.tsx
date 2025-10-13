/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Searchbar, ProgressBar } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

import { useNoxSetting } from '@stores/useApp';
import useSnack, { SetSnack } from '@stores/useSnack';

interface OnSearchProps {
  v: string;
  progressEmitter: (v: number) => void;
  setSnack: (v: SetSnack) => unknown;
}

interface Props {
  defaultSearchText?: string;
  onSearch: (p: OnSearchProps) => Promise<unknown>;
  placeholder?: string;
}

export default function SearchBar({
  onSearch = async v => console.log(v),
  defaultSearchText = '',
  placeholder,
}: Props) {
  const setSnack = useSnack(state => state.setSnack);
  const [searchVal, setSearchVal] = useState(defaultSearchText);
  const [searchProgress, progressEmitter] = useState(0);
  const playerStyle = useNoxSetting(state => state.playerStyle);

  const handleSearch = async (v = searchVal) => {
    progressEmitter(1);
    await onSearch({ v, progressEmitter, setSnack });
    progressEmitter(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Searchbar
          placeholder={placeholder}
          value={searchVal}
          onChangeText={setSearchVal}
          onSubmitEditing={() => handleSearch(searchVal)}
          selectTextOnFocus
          style={styles.textInput}
          selectionColor={playerStyle.customColors.textInputSelectionColor}
          onIconPress={() => handleSearch(searchVal)}
          numberOfLines={1}
          theme={{
            colors: {
              onSurfaceVariant: playerStyle.colors.onSurface,
              onSurface: playerStyle.colors.onSurfaceVariant,
            },
          }}
        />
      </View>
      <ProgressBar
        progress={Math.max(searchProgress, 0)}
        indeterminate={searchProgress === 1}
        style={styles.progressBar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 5,
    paddingTop: 5,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  textInput: {
    flex: 5,
  },
  progressBar: { backgroundColor: 'rgba(0, 0, 0, 0)' },
});
