import React, { useState } from 'react';
import { IconButton, Text, TextInput, ProgressBar } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import Snackbar from 'react-native-snackbar';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '../../hooks/useSetting';

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
    progressEmitter(100);
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
      <View
        style={[
          styles.row,
          { backgroundColor: playerStyle.colors.surfaceVariant },
        ]}
      >
        <TextInput
          style={styles.textInput}
          label={String(t('CustomSkin.SearchBarLabel'))}
          value={searchVal}
          onChangeText={val => setSearchVal(val)}
          onSubmitEditing={() => handleSearch(searchVal)}
          selectTextOnFocus
          selectionColor={playerStyle.customColors.textInputSelectionColor}
          textColor={playerStyle.colors.text}
        />
        <IconButton
          icon="search-web"
          onPress={() => handleSearch(searchVal)}
          size={30}
        />
      </View>
      <ProgressBar
        progress={Math.max(searchProgress, 0)}
        indeterminate={searchProgress === 1}
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
});

export default CustomSkinSearch;
