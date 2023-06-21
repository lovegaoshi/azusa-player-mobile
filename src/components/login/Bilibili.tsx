import * as React from 'react';
import { View, ActivityIndicator, SafeAreaView } from 'react-native';
import { Text, Avatar, Button } from 'react-native-paper';
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
import { getLoginStatus } from '../../utils/Login';
import GenericInputDialog from '../dialogs/GenericInputDialog';
import BiliSelectFavButtton from './BiliSelectFavButtton';
import { throttler } from '../../utils/throttle';

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
const getQRCodeAPI =
  'https://passport.bilibili.com/x/passport-login/web/qrcode/generate';
//'https://passport.bilibili.com/qrcode/getLoginUrl';
const probeQRCodeAPI =
  'https://passport.bilibili.com/x/passport-login/web/qrcode/poll';
//'https://passport.bilibili.com/qrcode/getLoginInfo';
const oauthKey = 'qrcode_key'; // 'oauthKey';

/**
 * TODO: doesnt work! oh no!
 */
const loginQRVerification = async () => {
  const verificationURL =
    'https://passport.bilibili.com/x/passport-login/web/sso/list?biliCSRF=';
  const biliJct = (await CookieManager.get('https://www.bilibili.com'))[
    'bili_jct'
  ]?.value;
  const res = await throttler.biliApiLimiter.schedule(async () =>
      bfetch(`${verificationURL}${biliJct}`, {
        method: 'GET',
        credentials: 'include',
        headers: {},
      })
    ),
    json = await res.json();
  logger.debug(json);
  await Promise.all(
    json.data.sso.map((url: string) =>
      throttler.biliApiLimiter.schedule(async () =>
        bfetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: {},
        })
      )
    )
  );
};

export default ({ navigation }: props) => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const [qrcode, setQrCode] = React.useState<string>('');
  const [qrcodeKey, setQrCodeKey] = React.useState<string>('');
  const [qrcodeExpire, setQrCodeExpire] = React.useState<number>(-1);
  const [loginInfo, setLoginInfo] = React.useState<LoginInfo | null>(null);
  const [initialize, setInitialize] = React.useState<boolean>(true);
  const [inputCookieVisible, setInputCookieVisible] = React.useState(false);

  const getBiliLoginStatus = async () => {
    setInitialize(true);
    const loginSuccess = (json: any) => json.code === 0 && json.data.isLogin;
    const parseJSON = (json: any) => {
      return {
        name: json.data.uname,
        id: json.data.mid,
        avatar: json.data.face,
      };
    };
    const res = await getLoginStatus(loginAPI, loginSuccess, parseJSON);
    if (res) {
      setLoginInfo(res);
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
      key: json.data[oauthKey],
      expire: 180,
    } as QRCodeReq;
  };

  const probeQRLogin = async () => {
    try {
      const response = await bfetch(
        `${probeQRCodeAPI}?${oauthKey}=${qrcodeKey}`
      );
      /**
      const response = await bfetch(probeQRCodeAPI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: {
          [oauthKey]: qrcodeKey,
        },
      });
       */
      const json = await response.json();
      logger.debug(
        `probing QR code login of ${qrcodeKey}, ${JSON.stringify(json)}`
      );
      if (json.code === 0) {
        // json.status
        const setCookie = response.headers.get('set-cookie');
        if (!setCookie) {
          logger.warn(
            `no set-cookie header found; res: ${JSON.stringify(json)}`
          );
          return;
        }
        logger.debug(`setCookie string: ${setCookie}`);
        addCookie(domain, setCookie);
        // url, refreshToken, timestamp.
        addCookie(`${domain}.data`, json.data);
        await CookieManager.setFromResponse(domain, setCookie);
        // HACK: set-cookie header doenst work. im taking advantage of the json.data.url
        // https://stackoverflow.com/questions/68805342/react-native-get-url-search-params
        for (const match of json.data.url.matchAll(/[?&]([^=]+)=([^&]*)/g)) {
          const [, key, value] = match;
          try {
            await CookieManager.set(domain, { name: key, value });
          } catch {
            logger.warn(`${key} and ${value} failed in saving cookie.`);
          }
        }
        logger.debug(await CookieManager.get(domain));
        clearQRLogin();
      }
    } catch (error) {
      // network error; abort qr login attempts
      clearQRLogin();
      console.error(error);
      Snackbar.show({
        text: t('Login.BilibiliLoginProbeFailed'),
      });
    }
  };

  const manualInputCookies = async (input: { [key: string]: string }) => {
    if (input.SESSDATA.length > 0 && input.bili_jct.length > 0) {
      await CookieManager.set(domain, {
        name: 'SESSDATA',
        value: input.SESSDATA,
      });
      await CookieManager.set(domain, {
        name: 'bili_jct',
        value: input.bili_jct,
      });
      logger.debug(await CookieManager.get(domain));
      clearQRLogin();
      getBiliLoginStatus();
    }
    setInputCookieVisible(false);
  };

  // check QR login status every 4 seconds
  React.useEffect(() => {
    if (qrcodeExpire < 0) return () => undefined;
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
    getBiliLoginStatus();
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
        <Text
          style={{
            paddingVertical: 20,
            textAlign: 'center',
          }}
        >
          {t('Login.BilibiliNotLoggedIn')}
        </Text>
        <Button mode="contained-tonal" onPress={generateBiliQRCode}>
          {t('Login.BilibiliLoginButton')}
        </Button>
        <View style={{ paddingVertical: 10 }} />
        <Button
          mode="contained-tonal"
          onPress={() => setInputCookieVisible(true)}
        >
          {t('Login.BilibiliCookieInputButton')}
        </Button>
        <Text>{t('Login.Disclaimer')}</Text>
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
      <View style={{ paddingHorizontal: 5 }}>
        <View
          style={{ flexDirection: 'row', paddingLeft: 20, paddingVertical: 10 }}
        >
          <Avatar.Image source={{ uri: loginInfo.avatar }}></Avatar.Image>
          <View style={{ paddingLeft: 10 }}>
            <Text variant="headlineSmall">{loginInfo.name}</Text>
            <Button onPress={logout}>LOGOUT</Button>
          </View>
        </View>
        <BiliSelectFavButtton />
        <Text>{t('Login.Disclaimer')}</Text>
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
      {initialize ? (
        <ActivityIndicator size={100} />
      ) : loginInfo ? (
        loggedInPage()
      ) : (
        loginPage()
      )}
      <GenericInputDialog
        options={['SESSDATA', 'bili_jct']}
        visible={inputCookieVisible}
        title={String(t('Login.BilibiliCookieInputDialogTitle'))}
        onClose={() => setInputCookieVisible(false)}
        onSubmit={manualInputCookies}
      ></GenericInputDialog>
    </SafeAreaView>
  );
};

/** head bar
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
 */
