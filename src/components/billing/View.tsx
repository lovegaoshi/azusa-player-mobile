import { View } from 'react-native';
import React, { useState } from 'react';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import Purchases from 'react-native-purchases';

import useVIP, { checkGuardVIP } from '@hooks/useVIP';
import { styles } from '../style';
import { StyleSheet } from 'react-native';

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
  const checkRevenueCatVIP = async () => {
    setLoading(true);
    try {
      console.log('purhcase', await Purchases.getOfferings());
    } catch (e) {
      console.error(JSON.stringify(e));
    }
    setLoading(false);
  };

  return (
    <Button onPress={checkRevenueCatVIP}>{t('Billing.RevenueCat')}</Button>
  );
};

const PurchaseVIPScreen = () => {
  const { t } = useTranslation();
  return (
    <View style={mStyle.container}>
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
});
