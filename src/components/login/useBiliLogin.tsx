import * as React from 'react';
import CookieManager from '@react-native-cookies/cookies';
import { useNoxSetting } from '../../hooks/useSetting';
import { logger } from '../../utils/Logger';
import bfetch from '../../utils/BiliFetch';
import { addCookie } from '../../utils/ChromeStorage';
import { getLoginStatus } from '../../utils/Login';
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

const getQRCodeAPI =
  'https://passport.bilibili.com/x/passport-login/web/qrcode/generate';
//'https://passport.bilibili.com/qrcode/getLoginUrl';
const probeQRCodeAPI =
  'https://passport.bilibili.com/x/passport-login/web/qrcode/poll';
//'https://passport.bilibili.com/qrcode/getLoginInfo';

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

const useBiliLogin = () => {
  const [qrcode, setQrCode] = React.useState<string>('');
  const [qrcodeKey, setQrCodeKey] = React.useState<string>('');
  const [qrcodeExpire, setQrCodeExpire] = React.useState<number>(-1);
  const [loginInfo, setLoginInfo] = React.useState<LoginInfo | null>(null);
  const [initialize, setInitialize] = React.useState<boolean>(true);
};

export default useBiliLogin;
