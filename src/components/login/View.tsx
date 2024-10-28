import { StyleSheet, View } from 'react-native';

import Bilibili from './bilibili/Bilibili';

export default () => {
  return (
    <View style={styles.container}>
      <Bilibili />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
