import { View, StyleSheet, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';

import useVIP, { checkGuardVIP, purchaseVIP } from '@hooks/useVIP';
import { styles } from '../style';
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

  const goToStripePay = () => Linking.openURL('https://stripe.com');

  if (APPSTORE) {
    return (
      <Button onPress={checkRevenueCatVIP}>{t('Billing.RevenueCat')}</Button>
    );
  }
  if (biliMid) {
    return (
      <Button onPress={goToStripePay}>
        {t('Billing.StripePurchase', { biliMid })}
      </Button>
    );
  }
  return <Text>{t('Billing.BiliUserNotLoggedIn')}</Text>;
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
        <LoadingIconWrapper Child={BiliVIP} />
        <LoadingIconWrapper Child={RevenueCatVIP} />
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

export default () => {
  const vip = useVIP(state => state.VIP);

  if (vip) {
    return <VIPScreen />;
  }
  return <PurchaseVIPScreen />;
};

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
