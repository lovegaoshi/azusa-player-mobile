/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import CookieManager from '@react-native-cookies/cookies';
import { useTranslation } from 'react-i18next';
import md5 from 'md5';

import { logger } from '@utils/Logger';
import useSnack from '@stores/useSnack';
import bfetch, { parseBodyParams } from '@utils/BiliFetch';
import { addCookie } from '@utils/ChromeStorage';
import { getLoginStatus } from '@utils/Login';
import { QRCodeReq, LoginInfo } from './useBiliLogin';
import { throttler } from '@utils/throttle';

// https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/login/login_action/QR.md#web%E7%AB%AF%E6%89%AB%E7%A0%81%E7%99%BB%E5%BD%95-%E6%97%A7%E7%89%88
/**
  impl AppKeyStore {
    fn app_key(&self) -> &'static str {
        match self {
            AppKeyStore::BiliTV => "4409e2ce8ffd12b8",
            AppKeyStore::Android => "783bbb7264451d82",
        }
    }

    fn appsec(&self) -> &'static str {
        match self {
            AppKeyStore::BiliTV => "59b43e04ad6965f34319062b478f83dd",
            AppKeyStore::Android => "2653583c8873dea268ab9386918b1d65",
        }
    }
 */

const domain = 'https://bilibili.com';
const loginAPI = 'https://api.bilibili.com/x/web-interface/nav';
const getQRCodeAPI =
  'https://passport.bilibili.com/x/passport-tv-login/qrcode/auth_code';
const probeQRCodeAPI =
  'https://passport.bilibili.com/x/passport-tv-login/qrcode/poll';
const oauthKey = 'auth_code';
const verificationURL =
  'https://passport.bilibili.com/x/passport-login/oauth2/refresh_token';

const signBody = (body: any) => {
  return md5(`${parseBodyParams(body)}59b43e04ad6965f34319062b478f83dd`);
};

const getCookies = async () => {
  const accessKey = (await CookieManager.get('https://www.bilibili.com'))[
    'access_key'
  ]?.value;

  const refreshToken = (await CookieManager.get('https://www.bilibili.com'))[
    'refresh_token'
  ]?.value;
  return { accessKey, refreshToken };
};

const loginQRVerification = async () => {
  const { accessKey, refreshToken } = await getCookies();
  if (!accessKey || !refreshToken) return false;
  const qrBody = {
    access_key: accessKey,
    actionKey: 'appkey',
    appkey: '4409e2ce8ffd12b8',
    refresh_token: refreshToken,
    ts: '0',
  };
  const res = await throttler.biliApiLimiter.schedule(async () =>
      bfetch(`${verificationURL}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: {
          ...qrBody,
          sign: signBody(qrBody),
        },
      })
    ),
    json = await res.json();
  await CookieManager.set(domain, {
    name: 'access_key',
    value: json.data.token_info.access_token,
  });
  await CookieManager.set(domain, {
    name: 'refresh_token',
    value: json.data.token_info.refresh_token,
  });
  await CookieManager.set(domain, {
    name: 'SESSDATA',
    value: json.data.cookie_info.cookies.filter(
      (val: any) => val.name === 'SESSDATA'
    )[0].value,
  });
  await CookieManager.set(domain, {
    name: 'bili_jct',
    value: json.data.cookie_info.cookies.filter(
      (val: any) => val.name === 'bili_jct'
    )[0].value,
  });
  return true;
};

export interface BiliLogin {
  qrcode: string;
  loginInfo: LoginInfo | null;
  initialize: boolean;
  setQrCode: React.Dispatch<React.SetStateAction<string>>;
  setQrCodeKey: React.Dispatch<React.SetStateAction<string>>;
  setQrCodeExpire: React.Dispatch<React.SetStateAction<number>>;
  setLoginInfo: React.Dispatch<React.SetStateAction<LoginInfo | null>>;
  clearQRLogin: () => void;
  getBiliLoginStatus: () => void;
  getQRLoginReq: () => Promise<QRCodeReq>;
  loginQRVerification: () => Promise<boolean>;
  confirmWebQRCode: (SESSDATA: string, bili_jct: string) => Promise<void>;
}

const useBiliLogin = (): BiliLogin => {
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
    const QRReqBody = {
      appkey: '4409e2ce8ffd12b8',
      local_id: '0',
      ts: 0, //Math.floor(Date.now() / 1000),
    };
    const response = await bfetch(getQRCodeAPI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: {
        ...QRReqBody,
        sign: signBody(QRReqBody),
      },
    });
    const json = await response.json();
    return {
      url: json.data.url,
      key: json.data[oauthKey],
      expire: 180,
    } as QRCodeReq;
  };

  const probeQRLogin = async () => {
    try {
      const probeBody = {
        appkey: '4409e2ce8ffd12b8',
        [oauthKey]: qrcodeKey,
        local_id: '0',
        ts: 0,
      };
      const response = await bfetch(probeQRCodeAPI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: {
          ...probeBody,
          sign: signBody(probeBody),
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
        } else {
          addCookie(domain, setCookie);
          await CookieManager.setFromResponse(domain, setCookie);
        }
        // url, refreshToken, timestamp.
        addCookie(`${domain}.data`, json.data);
        for (const cookieEntry of json.data.cookie_info.cookies) {
          try {
            await CookieManager.set(domain, {
              name: cookieEntry.name,
              value: cookieEntry.value,
            });
          } catch {
            logger.warn(
              `[biliLogin] ${JSON.stringify(
                cookieEntry
              )} failed in saving cookie.`
            );
          }
        }
        await CookieManager.set(domain, {
          name: 'access_token',
          value: json.data.access_token,
        });
        await CookieManager.set(domain, {
          name: 'refresh_token',
          value: json.data.refresh_token,
        });
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

  /**
   * this method converts input cookies into access_token and refresh_token via the APP way.
   */
  const confirmWebQRCode = async (SESSDATA: string, bili_jct: string) => {
    const { key } = await getQRLoginReq();

    const res = await bfetch(
      'https://passport.bilibili.com/x/passport-tv-login/h5/qrcode/confirm',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: `SESSDATA=${SESSDATA}; bili_jct=${bili_jct}`,
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64; rv:38.0) Gecko/20100101 Firefox/38.0 Iceweasel/38.2.1 BiliApp',
        },
        body: {
          auth_code: key,
          csrf: bili_jct,
          scanning_type: 3,
        },
      }
    );
    const json = await res.json();
    console.warn(json);
    clearQRLogin();
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
    loginQRVerification,
    confirmWebQRCode,
  };
};

export default useBiliLogin;
