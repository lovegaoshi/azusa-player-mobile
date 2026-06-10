import { ActivityIndicator } from 'react-native-paper';
import { Text, View } from 'react-native';

import APMActivityIndicator from '@components/commonui/ActivityIndicator';

export default () => {
  return (
    <View style={{ top: 100, alignItems: 'center' }}>
      <View style={{ flexDirection: 'row' }}>
        <Text>1234</Text>
        <ActivityIndicator size={50} />
        <Text>1234</Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <Text>1234</Text>
        <APMActivityIndicator size={50} />
        <Text>1234</Text>
      </View>
    </View>
  );
};
