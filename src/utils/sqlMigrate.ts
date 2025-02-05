import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorage2 from 'expo-sqlite/kv-store';

export default async (f = false) => {
  if (AsyncStorage2.getAllKeysSync().length > 0 && !f) {
    return;
  }
  const allKeys = await AsyncStorage.getAllKeys();
  const content = await AsyncStorage.multiGet(allKeys);
  // @ts-expect-error
  AsyncStorage2.multiSet.bind(AsyncStorage2)(content);
  AsyncStorage.clear();
};
