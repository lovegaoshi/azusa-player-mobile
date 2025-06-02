import React from 'react';
import { StyleSheet, View } from 'react-native';

import { NativeText as Text } from '@components/commonui/ScaledText';

export const PlaybackError: React.FC<{ error?: string }> = ({ error }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{error}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
  },
  text: {
    color: 'red',
    width: '100%',
    textAlign: 'center',
    marginTop: -15,
  },
});
