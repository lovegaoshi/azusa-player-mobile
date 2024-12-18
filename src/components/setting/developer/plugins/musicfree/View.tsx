import * as React from 'react';
import { Image } from 'expo-image';
import { View, SafeAreaView, StyleSheet, LayoutAnimation } from 'react-native';
import {
  Text,
  IconButton,
  TouchableRipple,
  RadioButton,
} from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';

import { styles } from '@components/style';
import Searchbar from './Searchbar';
import { useNoxSetting } from '@stores/useApp';

const MFSettings = () => {
  const MFsdks = useNoxSetting(state => state.MFsdks);
  return (
    <SafeAreaView style={styles.flex}>
      <Searchbar />
      <FlashList
        data={MFsdks}
        renderItem={({ item }) => (
          <Text> {`${item.platform} ${item.version}`} </Text>
        )}
      />
    </SafeAreaView>
  );
};

export default MFSettings;
