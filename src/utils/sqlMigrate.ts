import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorage2 from 'expo-sqlite/kv-store';

export default async () => {
  const allKeys = await AsyncStorage.getAllKeys();
  if (allKeys.length === 0) {
    return;
  }
  const content = await AsyncStorage.multiGet(allKeys);
  await AsyncStorage2.clear();
  // @ts-expect-error
  await AsyncStorage2.multiSet.bind(AsyncStorage2)(content);
  await AsyncStorage.clear();
};
