import { authorize } from 'react-native-app-auth';

import logger from '@utils/Logger';
import { getValueFor, save } from '@utils/SecureStorage';
import { DEFAULT_UA } from '@utils/BiliFetch';

const config = {
  issuer: 'https://accounts.google.com',
  clientId:
    '369249578889-cvr47cn786i0scicobhlljidu1b32572.apps.googleusercontent.com',
  redirectUrl:
    'com.googleusercontent.apps.369249578889-cvr47cn786i0scicobhlljidu1b32572:/oauth2redirect/google',
  // clientSecret: 'SboVhoG9s0rNafixCSGGKXAT',
  scopes: ['openid', 'profile'],
  AdditionalHeaders: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0Cobalt/Version',
  },
};

// Log in to get an authentication token
export const getAuthCode = async () => {
  const authState = await authorize(config);
  logger.log(authState);
};
