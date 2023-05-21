import * as React from 'react';
import { View, ActivityIndicator, SafeAreaView } from 'react-native';
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
import CookieManager from '@react-native-cookies/cookies';

import { useNoxSetting } from '../../hooks/useSetting';
import { logger } from '../../utils/Logger';
import bfetch from '../../utils/BiliFetch';
import { addCookie } from '../../utils/ChromeStorage';

interface QRCodeReq {
  url: string;
  key: string;
  expire: number;
}

interface LoginInfo {
  name: string;
  id: string;
  avatar: string;
}

interface props {
  navigation: DrawerNavigationProp<ParamListBase>;
}

const domain = 'https://bilibili.com';
const loginAPI = 'https://api.bilibili.com/x/web-interface/nav';
const getQRCodeAPI = 'https://passport.bilibili.com/qrcode/getLoginUrl';
const probeQRCodeAPI = 'https://passport.bilibili.com/qrcode/getLoginInfo';

export default ({ navigation }: props) => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const [qrcode, setQrCode] = React.useState<string>('');
  const [qrcodeKey, setQrCodeKey] = React.useState<string>('');
  const [qrcodeExpire, setQrCodeExpire] = React.useState<number>(-1);
  const [loginInfo, setLoginInfo] = React.useState<LoginInfo | null>(null);
  const [initialize, setInitialize] = React.useState<boolean>(true);

  const getLoginStatus = async () => {
    try {
      const response = await bfetch(loginAPI);
      const json = await response.json();
      logger.debug(`get login status: ${JSON.stringify(json)}`);
      if (json.code === 0) {
        if (json.data.isLogin) {
          //success
          setLoginInfo({
            name: json.data.uname,
            id: json.data.mid,
            avatar: json.data.face,
          });
        }
      }
    } catch (e) {
      logger.error(`get login status error: ${e}`);
    }
    setInitialize(false);
  };

  const clearQRLogin = async () => {
    setQrCode('');
    setQrCodeExpire(-1);
  };

  const getQRLoginReq = async () => {
    // https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/login/login_action/QR.md
    // https://passport.bilibili.com/x/passport-login/web/qrcode/generate doesnt work.
    const response = await fetch(getQRCodeAPI);
    const json = await response.json();
    return {
      url: json.data.url,
      key: json.data.oauthKey,
      expire: 180,
    } as QRCodeReq;
  };

  const probeQRLogin = async () => {
    try {
      const response = await bfetch(probeQRCodeAPI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: {
          oauthKey: qrcodeKey,
        },
      });
      const json = await response.json();
      logger.debug(
        `probing QR code login of ${qrcodeKey}, ${JSON.stringify(json)}`
      );
      if (json.status) {
        const setCookie = response.headers.get('set-cookie');
        if (!setCookie) {
          logger.error(
            `no set-cookie header found; res: ${JSON.stringify(json)}`
          );
          return;
        }
        addCookie(domain, setCookie);
        await CookieManager.setFromResponse(domain, setCookie);
        clearQRLogin();
        getLoginStatus();
      }
    } catch {
      // network error; abort qr login attempts
      clearQRLogin();
      Snackbar.show({
        text: t('Login.BilibiliLoginProbeFailed'),
      });
    }
  };

  // check QR login status every 4 seconds
  React.useEffect(() => {
    if (qrcodeExpire < 0) return () => void 0;
    const timer = setInterval(() => {
      setQrCodeExpire(val => val - 4);
      if (qrcodeExpire === 0) {
        clearInterval(timer);
        setQrCode('');
        Snackbar.show({
          text: t('Login.BilibiliLoginQRExpired'),
        });
      } else {
        probeQRLogin();
      }
    }, 4000);

    return () => {
      clearInterval(timer);
    };
  });

  React.useEffect(() => {
    getLoginStatus();
  }, []);

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
    if (!loginInfo) return <></>;
    const logout = () => {
      setLoginInfo(null);
      CookieManager.clearAll();
    };
    return (
      <View style={{ flexDirection: 'row', paddingLeft: 20 }}>
        <Avatar.Image source={{ uri: loginInfo.avatar }}></Avatar.Image>
        <View style={{ paddingLeft: 10 }}>
          <Text variant="headlineSmall">{loginInfo.name}</Text>
          <Button onPress={logout}>LOGOUT</Button>
        </View>
      </View>
    );
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
      {initialize ? (
        <ActivityIndicator size={100} />
      ) : loginInfo ? (
        loggedInPage()
      ) : (
        loginPage()
      )}
    </SafeAreaView>
  );
};
