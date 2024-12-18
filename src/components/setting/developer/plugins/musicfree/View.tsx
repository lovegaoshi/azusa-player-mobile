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

const MFSettings = () => {
  return (
    <SafeAreaView style={styles.flex}>
      <Searchbar />
    </SafeAreaView>
  );
};

export default MFSettings;
