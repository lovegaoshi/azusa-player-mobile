import { View, StyleSheet, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Button, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';

import { PaperText as Text } from '@components/commonui/ScaledText';
import useVIP, { checkGuardVIP, purchaseVIP } from '@hooks/useVIP';
import { styles } from '../style';
// eslint-disable-next-line import/no-unresolved
import { APPSTORE } from '@env';
import getUser from '@utils/Bilibili/BiliUser';

interface LoadingChildrenProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
interface LoadingWrapperProps {
  Child: (p: LoadingChildrenProps) => JSX.Element;
}

const LoadingIconWrapper = ({ Child }: LoadingWrapperProps) => {
  const [loading, setLoading] = useState(false);
  if (loading) {
    return <ActivityIndicator />;
  }
  return <Child setLoading={setLoading} />;
};

const BiliVIP = ({ setLoading }: LoadingChildrenProps) => {
  const { t } = useTranslation();

  const checkBiliVIP = async () => {
    setLoading(true);
    await checkGuardVIP();
    setLoading(false);
  };

  return <Button onPress={checkBiliVIP}>{t('Billing.NoxAuth')}</Button>;
};

const RevenueCatVIP = ({ setLoading }: LoadingChildrenProps) => {
  const { t } = useTranslation();
  const [biliMid, setBiliMid] = useState<number>();

  useEffect(() => {
    if (APPSTORE) {
      return;
    }
    getUser().then(u => setBiliMid(u.mid));
  }, []);

  const checkRevenueCatVIP = async () => {
    setLoading(true);
    purchaseVIP();
    setLoading(false);
  };

  if (APPSTORE) {
    return (
      <Button onPress={checkRevenueCatVIP}>{t('Billing.RevenueCat')}</Button>
    );
  }
  if (biliMid) {
    return (
      <View>
        <Button onPress={checkRevenueCatVIP}>
          {t('Billing.StripePurchase')}
        </Button>
        <Pressable onPress={() => Clipboard.setStringAsync(`${biliMid}`)}>
          <Text>{t('Billing.StripePurchaseNote', { biliMid })}</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View>
      <Button disabled>{t('Billing.StripePurchase')}</Button>
      <Text>{t('Billing.BiliUserNotLoggedIn')}</Text>
    </View>
  );
};

const PurchaseVIPScreen = () => {
  const { t } = useTranslation();

  return (
    <View style={mStyle.container}>
      <Image
        style={mStyle.azusaBeg}
        source={{
          uri: 'https://img.nga.178.com/attachments/mon_202201/31/-zue37Q2p-ixpkXsZ7tT3cS9y-af.gif',
        }}
      />
      <Text>{t('Billing.PremiumFeaturesIntro')}</Text>
      <View style={styles.alignMiddle}>
        <LoadingIconWrapper Child={RevenueCatVIP} />
        <LoadingIconWrapper Child={BiliVIP} />
      </View>
      <Text>{t('Billing.NoxFans')}</Text>
    </View>
  );
};

const VIPScreen = () => {
  const { t } = useTranslation();

  return (
    <View style={mStyle.container}>
      <Image
        style={mStyle.azusaMock}
        source={{
          uri: 'https://img.nga.178.com/attachments/mon_202202/01/-zue37Q2p-6rfwK2dT1kShs-b4.jpg',
        }}
      />
      <Text style={styles.centerText}>{t('Billing.thankU')}</Text>
      <Text style={styles.centerText}>{t('Billing.godBlessU')}</Text>
      <Text style={styles.centerText}>{t('Billing.urVeryVeryGorgeous')}</Text>
    </View>
  );
};

export default function BillingView() {
  const vip = useVIP(state => state.VIP);

  if (vip) {
    return <VIPScreen />;
  }
  return <PurchaseVIPScreen />;
}

const mStyle = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 10, paddingTop: 10 },
  text: {
    fontSize: 20,
  },
  azusaBeg: {
    width: '100%',
    height: '40%',
    alignSelf: 'center',
  },
  azusaMock: {
    width: '100%',
    height: '30%',
    alignSelf: 'center',
  },
});
