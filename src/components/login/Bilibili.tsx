import * as React from 'react';
import FastImage from 'react-native-fast-image';
import { View, FlatList, SafeAreaView } from 'react-native';
import {
  Text,
  IconButton,
  TouchableRipple,
  Card,
  Avatar,
  Button,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-native-qrcode-svg';
import Snackbar from 'react-native-snackbar';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ParamListBase } from '@react-navigation/native';

import useAlert from '../dialogs/useAlert';
import { useNoxSetting } from '../../hooks/useSetting';
import { logger } from '../../utils/Logger';
import bfetch from '../../utils/BiliFetch';

interface QRCodeReq {
  url: string;
  key: string;
  expire: number;
}

interface props {
  navigation: DrawerNavigationProp<ParamListBase>;
}

export default ({ navigation }: props) => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const { OneWayAlert } = useAlert();
  const [qrcode, setQrCode] = React.useState<string>('');
  const [qrcodeKey, setQrCodeKey] = React.useState<string>('');
  const [qrcodeExpire, setQrCodeExpire] = React.useState<number>(0);

  const clearQRLogin = async () => {
    setQrCode('');
    setQrCodeExpire(-1);
  };

  const getQRLoginReq = async () => {
    // https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/login/login_action/QR.md
    // https://passport.bilibili.com/x/passport-login/web/qrcode/generate doesnt work.
    const response = await fetch(
      'https://passport.bilibili.com/qrcode/getLoginUrl'
    );
    const json = await response.json();
    return {
      url: json.data.url,
      key: json.data.oauthKey,
      expire: 180,
    } as QRCodeReq;
  };

  const probeQRLogin = async () => {
    try {
      const response = await bfetch(
        'https://passport.bilibili.com/qrcode/getLoginInfo',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: {
            oauthKey: qrcodeKey,
          },
        }
      );
      const json = await response.json();
      logger.debug(
        `probing QR code login of ${qrcodeKey}, ${JSON.stringify(json)}`
      );
      if (json.status) {
        console.log(response.headers);
        clearQRLogin();
      }
    } catch {
      // network error; abort qr login attempts
      clearQRLogin();
      Snackbar.show({
        text: t('Login.BilibiliLoginProbeFailed'),
      });
    }
  };

  React.useEffect(() => {
    if (qrcodeExpire < 0) return () => void 0;
    const timer = setInterval(() => {
      setQrCodeExpire(val => val - 3);
      if (qrcodeExpire === 0) {
        clearInterval(timer);
        setQrCode('');
        Snackbar.show({
          text: t('Login.BilibiliLoginQRExpired'),
        });
      } else {
        probeQRLogin();
      }
    }, 3000);

    return () => {
      clearInterval(timer);
    };
  });

  const loginPage = () => {
    const generateBiliQRCode = async () => {
      try {
        Snackbar.show({
          text: t('Login.BilibiliLoginQRGeneration'),
          duration: Snackbar.LENGTH_INDEFINITE,
        });
        const qrCodeReq = await getQRLoginReq();
        setQrCode(qrCodeReq.url);
        setQrCodeKey(qrCodeReq.key);
        setQrCodeExpire(qrCodeReq.expire);
        Snackbar.dismiss();
        Snackbar.show({
          text: t('Login.BilibiliLoginQRGenerated'),
        });
      } catch (error) {
        Snackbar.dismiss();
        Snackbar.show({
          text: t('Login.BilibiliLoginQRGenerateFailed'),
        });
        logger.error(error);
      }
    };

    return (
      <View style={{ alignContent: 'center', alignItems: 'center' }}>
        <Text style={{ paddingVertical: 20 }}>
          {t('Login.BilibiliNotLoggedIn')}
        </Text>
        <Button mode="contained-tonal" onPress={generateBiliQRCode}>
          {t('Login.BilibiliLoginButton')}
        </Button>
        <View style={{ paddingVertical: 10 }} />
        {qrcode !== '' && <QRCode value={qrcode} size={300} />}
      </View>
    );
  };

  const loggedInPage = () => {
    return <View style={{ flexDirection: 'row' }}></View>;
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        flex: 1,
      }}
    >
      <Card.Title
        title="Bilibili"
        left={props => (
          <IconButton
            {...props}
            icon="menu"
            size={40}
            onPress={() => navigation.openDrawer()}
          />
        )}
        titleVariant="headlineLarge"
        titleStyle={{ paddingLeft: 10 }}
      />
      {loginPage()}
    </SafeAreaView>
  );
};
