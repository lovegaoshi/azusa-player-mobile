import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import Purchases from 'react-native-purchases';

import { isAndroid } from '@utils/RNUtils';
// eslint-disable-next-line import/no-unresolved
import { APPSTORE } from '@env';

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

export const useSetupVIP = () => {
  const { vip } = useVIP();

  const init = async () => {
    if (!APPSTORE) {
      return;
    }
    if (isAndroid) {
      Purchases.configure({ apiKey: 'goog_XXAuAgmqFMypeJIGHTlyRZNdoGh' });
    }
    try {
      console.log('purhcase', await Purchases.getCustomerInfo());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    init();
  }, []);
  return { vip };
};

export default useVIP;
