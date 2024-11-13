import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import Purchases from 'react-native-purchases';
import { create } from 'zustand';

import { isAndroid } from '@utils/RNUtils';
import { getHasGuard } from '@utils/Bilibili/BiliUser';
// eslint-disable-next-line import/no-unresolved
import { APPSTORE } from '@env';

const VIPKey = 'APMVIP';
enum VIPType {
  Bilibili = 'Bilibili',
  RevenueCat = 'RevenueCat',
}

export const checkGuardVIP = async () => {
  if (await getHasGuard([529249, 7706705])) {
    return purchaseVIP();
  }
  return loseVIP();
};

export const checkVIP = async () => {
  const vipStatus = SecureStore.getItem(VIPKey);
  switch (vipStatus) {
    // BILI VIP will be rechecked every time
    case VIPType.Bilibili:
      return checkGuardVIP();
    // revenueCat is a one-time purchase
    default:
      return;
  }
};

export const purchaseVIP = (type = VIPType.RevenueCat) => {
  SecureStore.setItemAsync(VIPKey, type);
  useVIP.setState({ VIP: true });
};

const loseVIP = () => {
  SecureStore.deleteItemAsync(VIPKey);
  useVIP.setState({ VIP: false });
};

interface VIPStore {
  VIP: boolean;
}
const useVIP = create<VIPStore>(() => ({
  VIP: SecureStore.getItem(VIPKey) !== null,
}));

export default useVIP;

export const useSetupVIP = () => {
  const vip = useVIP(state => state.VIP);

  const init = async () => {
    if (!APPSTORE) {
      return;
    }
    if (isAndroid) {
      Purchases.configure({ apiKey: 'goog_XXAuAgmqFMypeJIGHTlyRZNdoGh' });
    }
    checkVIP();
  };

  useEffect(() => {
    init();
  }, []);
  return { vip };
};
