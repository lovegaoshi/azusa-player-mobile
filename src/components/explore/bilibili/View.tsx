import * as React from 'react';
import { View, ScrollView, Text, Dimensions } from 'react-native';

import { fetchDynamic } from '@utils/mediafetch/biliDynamic';
import { fetchRanking } from '@utils/mediafetch/biliRanking';
import { styles } from '@components/style';

export default () => {
  React.useEffect(() => {
    console.log('entering bilibili explore...');
  }, []);

  return (
    <View style={styles.flex}>
      <ScrollView
        horizontal
        disableIntervalMomentum
        snapToInterval={Dimensions.get('window').width * 0.8}
        style={styles.flex}
      >
        <Text style={{ fontSize: 50, color: 'white' }}>Coming Soon1</Text>
        <Text style={{ fontSize: 50, color: 'white' }}>Coming Soon2</Text>
        <Text style={{ fontSize: 50, color: 'white' }}>Coming Soon3</Text>
        <Text style={{ fontSize: 50, color: 'white' }}>Coming Soon4</Text>
        <Text style={{ fontSize: 50, color: 'white' }}>Coming Soon5</Text>
        <Text style={{ fontSize: 50, color: 'white' }}>Coming Soon6</Text>
        <Text style={{ fontSize: 50, color: 'white' }}>Coming Soon7</Text>
        <Text style={{ fontSize: 50, color: 'white' }}>Coming Soon8</Text>
      </ScrollView>
    </View>
  );
};
