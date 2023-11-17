import { useState } from 'react';

import bfetch from '@utils/BiliFetch';

// Extracted from Youtube APP (Originally from: pytube)
const CLIENT_ID =
  '861556708454-d6dlm3lh05idd8npek18k6be8ba3oc68.apps.googleusercontent.com';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CLIENT_SECRET = 'SboVhoG9s0rNafixCSGGKXAT';

interface Props {
  setWebView: (val: boolean) => void;
}

const useGoogleTVOauth = ({ setWebView }: Props) => {
  const [loginCodes, setLoginCodes] = useState({});
  const [userURL, setUserURL] = useState('');
  //www.google.com/device?user_code=LNQJ-HZCV

  const getNewLoginCode = async () => {
    const res = await bfetch('https://oauth2.googleapis.com/device/code', {
      method: 'POST',
      body: JSON.stringify({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/youtube',
      }),
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
      },
    });
    if (res.status !== 200)
      throw new Error('Failed to get new Google Login Code');

    const resJSON = await res.json();

    const result = {
      userCode: resJSON.user_code,
      deviceCode: resJSON.device_code,
      userUrl: resJSON.verification_url,
      expiresIn: resJSON.expires_in,
      interval: 5,
    };
    setLoginCodes(result);
    setUserURL(`${result.userUrl}?user_code=${result.userCode}`);
    setWebView(true);
    return result;
  };

  return { userURL, loginCodes, getNewLoginCode };
};
export default useGoogleTVOauth;
