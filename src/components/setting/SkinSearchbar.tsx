import React, { useState } from 'react';
import { Searchbar, ProgressBar } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@hooks/useSetting';

interface props {
  onSearched: (val: any) => void;
}
const CustomSkinSearch = ({
  onSearched = (vals: any) => console.log(vals),
}: props) => {
  const { t } = useTranslation();
  const [searchVal, setSearchVal] = useState(
    'https://raw.githubusercontent.com/lovegaoshi/azusa-player-mobile/master/src/components/styles/steria.json'
  );
  const [searchProgress, progressEmitter] = useState(0);
  const playerStyle = useNoxSetting(state => state.playerStyle);

  const handleSearch = async (val = searchVal) => {
    progressEmitter(1);
    try {
      const searchedResult = await (await fetch(val)).json();
      onSearched(searchedResult);
    } catch {
      Snackbar.show({ text: t('CustomSkin.SearchFailMsg') });
    } finally {
      progressEmitter(0);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Searchbar
          placeholder={String(t('CustomSkin.SearchBarLabel'))}
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
