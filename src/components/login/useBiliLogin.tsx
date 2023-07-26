import * as React from 'react';
import CookieManager from '@react-native-cookies/cookies';
import { useTranslation } from 'react-i18next';
import Snackbar from 'react-native-snackbar';

import { useNoxSetting } from 'hooks/useSetting';
import { logger } from '@utils/Logger';
import bfetch from '@utils/BiliFetch';
import { addCookie } from '@utils/ChromeStorage';
import { getLoginStatus } from '@utils/Login';
import { throttler } from '@utils/throttle';

export interface QRCodeReq {
  url: string;
  key: string;
  expire: number;
}

export interface LoginInfo {
  name: string;
  id: string;
  avatar: string;
}

// https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/login/login_action/QR.md#%E7%94%B3%E8%AF%B7%E4%BA%8C%E7%BB%B4%E7%A0%81web%E7%AB%AF

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

const useBiliLogin = () => {
  const { t } = useTranslation();
  const [qrcode, setQrCode] = React.useState<string>('');
  const [qrcodeKey, setQrCodeKey] = React.useState<string>('');
  const [qrcodeExpire, setQrCodeExpire] = React.useState<number>(-1);
  const [loginInfo, setLoginInfo] = React.useState<LoginInfo | null>(null);
  const [initialize, setInitialize] = React.useState<boolean>(true);

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
        `[biliLogin] probing QR code login of ${qrcodeKey}, ${JSON.stringify(
          json
        )}`
      );
      if (json.code === 0) {
        // json.status
        const setCookie = response.headers.get('set-cookie');
        if (!setCookie) {
          logger.warn(
            `[biliLogin] no set-cookie header found; res: ${JSON.stringify(
              json
            )}`
          );
          return;
        }
        logger.debug(`[biliLogin] setCookie string: ${setCookie}`);
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
            logger.warn(
              `[biliLogin] ${key} and ${value} failed in saving cookie.`
            );
          }
        }
        logger.debug(`[biliLogin] ${await CookieManager.get(domain)}`);
        clearQRLogin();
      }
    } catch (error) {
      // network error; abort qr login attempts
      clearQRLogin();
      logger.error(`[biliLogin] ${error}`);
      Snackbar.show({
        text: t('Login.BilibiliLoginProbeFailed'),
      });
    }
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

  return {
    qrcode,
    loginInfo,
    initialize,
    setQrCode,
    setQrCodeKey,
    setQrCodeExpire,
    setLoginInfo,
    clearQRLogin,
    getBiliLoginStatus,
    getQRLoginReq,
  };
};

export default useBiliLogin;
