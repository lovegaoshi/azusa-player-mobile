import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import Purchases from 'react-native-purchases';
import { create } from 'zustand';
import { Purchases as PurchasesWeb } from '@revenuecat/purchases-js';
import { Linking } from 'react-native';

import { isAndroid } from '@utils/RNUtils';
import { getUser, getHasGuard } from '@utils/Bilibili/BiliUser';
// eslint-disable-next-line import/no-unresolved
import { APPSTORE, REVENUECAT_GOOGLE, REVENUECAT_STRIPE } from '@env';
import logger from '@utils/Logger';

const VIPKey = 'APMVIP';
const VIPId = 'apm-pro';
enum VIPType {
  Bilibili = 'Bilibili',
  RevenueCat = 'RevenueCat',
}
let isRevenueCatInitialized = false;

const initRevenueCatWeb = async (userid?: string) => {
  if (isRevenueCatInitialized) {
    return;
  }
  const mUserid = userid ?? (await getUser()).mid;
  if (mUserid === undefined) {
    // logger.error('[initRevenueCatWeb] mid is undefined');
    // setSnackMsg(i18n.t('Billing.MustLoginBilibili'));
    throw new Error('[initRevenueCatWeb] mid is undefined');
  }
  logger.info(`[APMVIP] ${mUserid}`);
  isRevenueCatInitialized = true;
  PurchasesWeb.configure(REVENUECAT_STRIPE, `${mUserid}`, {
    proxyURL: 'https://api.rc-backup.com',
  });
};

const getVIPStatus = async () => {
  if (APPSTORE) {
    const customerInfo = await Purchases.getCustomerInfo();
    logger.info(JSON.stringify(customerInfo));
    return customerInfo.entitlements.active[VIPId] !== undefined;
  }
  await initRevenueCatWeb();
  const customerInfo = await PurchasesWeb.getSharedInstance().getCustomerInfo();
  logger.info(JSON.stringify(customerInfo));
  return customerInfo.entitlements.active[VIPId] !== undefined;
};

export const purchaseVIP = async () => {
  let APMActive = false;
  try {
    if (await getVIPStatus()) {
      return setVIP(VIPType.RevenueCat);
    }
    if (APPSTORE) {
      const offerings = await Purchases.getOfferings();
      if (
        offerings.current !== null &&
        offerings.current.availablePackages.length !== 0
      ) {
        const { customerInfo } = await Purchases.purchasePackage(
          offerings.current.availablePackages[0],
        );
        APMActive = customerInfo.entitlements.active[VIPId] !== undefined;
      }
    } else {
      return Linking.openURL('https://buy.stripe.com/3cs17p4Lj6KZ9B64gg');
      /**
       * TODO: in-app purchase page later
      const offerings = await PurchasesWeb.getSharedInstance().getOfferings();
      if (
        offerings.current !== null &&
        offerings.current.availablePackages.length !== 0
      ) {
        // HACK: have to make our own payment sheet, or really just use a webview
        const { customerInfo } =
          await PurchasesWeb.getSharedInstance().purchase({
            rcPackage: offerings.current.availablePackages[0],
          });
        APMActive = customerInfo.entitlements.active[VIPId] !== undefined;
      }
       */
    }
  } catch (e) {
    logger.error(JSON.stringify(e));
  }
  if (APMActive) {
    setVIP(VIPType.RevenueCat);
  }
};

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

export const setVIP = (type = VIPType.RevenueCat) => {
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
    if (APPSTORE) {
      if (isAndroid) {
        Purchases.configure({ apiKey: REVENUECAT_GOOGLE });
      }
    } else {
      initRevenueCatWeb();
    }
    checkVIP();
  };

  useEffect(() => {
    init();
  }, []);
  return { vip };
};
