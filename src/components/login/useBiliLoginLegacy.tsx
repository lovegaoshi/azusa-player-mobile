/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import CookieManager from '@react-native-cookies/cookies';
import { useTranslation } from 'react-i18next';

import { logger } from '@utils/Logger';
import useSnack from '@stores/useSnack';
import bfetch from '@utils/BiliFetch';
import { addCookie } from '@utils/ChromeStorage';
import { getLoginStatus } from '@utils/Login';
import { QRCodeReq, LoginInfo } from './useBiliLogin';

// https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/login/login_action/QR.md#web%E7%AB%AF%E6%89%AB%E7%A0%81%E7%99%BB%E5%BD%95-%E6%97%A7%E7%89%88

const domain = 'https://bilibili.com';
const loginAPI = 'https://api.bilibili.com/x/web-interface/nav';
const getQRCodeAPI = 'https://passport.bilibili.com/qrcode/getLoginUrl';
const probeQRCodeAPI = 'https://passport.bilibili.com/qrcode/getLoginInfo';
const oauthKey = 'oauthKey';

const useBiliLogin = () => {
  const { t } = useTranslation();
  const setSnack = useSnack(state => state.setSnack);
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
      const response = await bfetch(probeQRCodeAPI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: {
          [oauthKey]: qrcodeKey,
        },
      });
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
        logger.debug(await CookieManager.get(domain));
        clearQRLogin();
      }
    } catch (error) {
      // network error; abort qr login attempts
      clearQRLogin();
      logger.error(`[biliLogin] ${error}`);
      setSnack({
        snackMsg: { success: t('Login.BilibiliLoginProbeFailed') },
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
        setSnack({
          snackMsg: { success: t('Login.BilibiliLoginQRExpired') },
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
