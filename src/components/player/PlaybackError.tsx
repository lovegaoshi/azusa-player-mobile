import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useStore } from 'zustand';
import appStore from '@stores/appStore';

export const PlaybackError: React.FC<{
  error?: string;
  code?: string;
}> = ({ error, code }) => {
  const fetchProgress = useStore(appStore, state => state.fetchProgress);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {code === 'ios_failed_to_load_resource' && fetchProgress !== 100
          ? `Fetch Progress: ${fetchProgress}%`
          : error}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  text: {
    color: 'red',
    width: '100%',
    textAlign: 'center',
  },
});
