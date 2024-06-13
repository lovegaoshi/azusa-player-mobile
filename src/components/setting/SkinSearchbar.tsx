/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Searchbar, ProgressBar } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';
import useSnack from '@stores/useSnack';

interface Props {
  onSearched: (val: any) => void;
}
const CustomSkinSearch = ({
  onSearched = (vals: any) => console.log(vals),
}: Props) => {
  const { t } = useTranslation();
  const setSnack = useSnack(state => state.setSnack);
  const [searchVal, setSearchVal] = useState(
    'https://raw.githubusercontent.com/lovegaoshi/azusa-player-mobile/master/src/components/styles/steria.json'
  );
  const [searchProgress, progressEmitter] = useState(0);
  const playerStyle = useNoxSetting(state => state.playerStyle);

  const handleSearch = async (val = searchVal) => {
    progressEmitter(1);
    try {
      const res = await fetch(val);
      const searchedResult = await res.json();
      onSearched(searchedResult);
    } catch {
      setSnack({
        snackMsg: { success: t('CustomSkin.SearchFailMsg') },
      });
    } finally {
      progressEmitter(0);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Searchbar
          placeholder={t('CustomSkin.SearchBarLabel')}
          value={searchVal}
          onChangeText={setSearchVal}
          onSubmitEditing={() => handleSearch(searchVal)}
          selectTextOnFocus
          style={styles.textInput}
          selectionColor={playerStyle.customColors.textInputSelectionColor}
          onIconPress={() => handleSearch(searchVal)}
        />
      </View>
      <ProgressBar
        progress={Math.max(searchProgress, 0)}
        indeterminate={searchProgress === 1}
        style={styles.progressBar}
      />
    </View>
  );
};

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

export default CustomSkinSearch;
