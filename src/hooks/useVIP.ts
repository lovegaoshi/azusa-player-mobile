import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import Purchases from 'react-native-purchases';
import { create } from 'zustand';
import { initStripe } from '@stripe/stripe-react-native';

import { isAndroid } from '@utils/RNUtils';
import { getHasGuard } from '@utils/Bilibili/BiliUser';
import {
  APPSTORE,
  REVENUECAT_GOOGLE,
  REVENUECAT_STRIPE,
  STRIPE_API_KEY,
  // eslint-disable-next-line import/no-unresolved
} from '@env';

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

const revenueCatAPI = () => {
  if (APPSTORE) {
    if (isAndroid) {
      return REVENUECAT_GOOGLE;
    }
  }
  return REVENUECAT_STRIPE;
};

export const useSetupVIP = () => {
  const vip = useVIP(state => state.VIP);

  const init = async () => {
    console.log(revenueCatAPI());
    Purchases.configure({ apiKey: revenueCatAPI() });
    if (!APPSTORE) {
      initStripe({
        publishableKey: STRIPE_API_KEY,
      });
    }
    checkVIP();
  };

  useEffect(() => {
    init();
  }, []);
  return { vip };
};
