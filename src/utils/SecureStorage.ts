import * as SecureStore from 'expo-secure-store';

export const save = (key: string, value: string) =>
  SecureStore.setItemAsync(key, value);

export const getValueFor = (key: string) => SecureStore.getItemAsync(key);
