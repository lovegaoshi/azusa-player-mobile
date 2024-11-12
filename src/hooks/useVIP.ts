import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';

const VIPKey = 'APMVIP';

export const purchaseVIP = () => {
  SecureStore.setItemAsync(VIPKey, '1');
};

export const loseVIP = () => {
  SecureStore.deleteItemAsync(VIPKey);
};

const useVIP = () => {
  const [vip, setVip] = useState(SecureStore.getItem(VIPKey) !== null);

  return { vip };
};

export default useVIP;
