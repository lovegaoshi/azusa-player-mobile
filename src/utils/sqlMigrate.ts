import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorage2 from 'expo-sqlite/kv-store';

import { StorageKeys } from '@enums/Storage';
import { getItem, saveItem } from './ChromeStorageAPI';

export default async () => {
  if (await getItem(StorageKeys.EXPO_SQL_MIGRATION, false)) {
    return;
  }
  const allKeys = await AsyncStorage.getAllKeys();
  const content = await AsyncStorage.multiGet(allKeys);
  // @ts-expect-error
  AsyncStorage2.multiSet.bind(AsyncStorage2)(content);
  AsyncStorage.clear();
  saveItem(StorageKeys.EXPO_SQL_MIGRATION, true);
};
