import { Platform } from 'react-native';
import { loadAsync, exchangeCodeAsync } from 'expo-auth-session';
import { authorize } from 'react-native-app-auth';
interface Config {
  redirectUrl: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
  additionalHeaders?: { Accept: string };
  serviceConfiguration: {
    authorizationEndpoint: string;
    tokenEndpoint: string;
    revocationEndpoint?: string;
  };
}

export const RedirectUrl = 'com.noxplayer://oauthredirect';

const expoAuth = async (config: Config) => {
  const authReq = await loadAsync(config, config.serviceConfiguration);
  const authState = await authReq.promptAsync(config.serviceConfiguration);
  if (authState.type !== 'success') {
    throw new Error(JSON.stringify(authState));
  }
  const accessTokenState = await exchangeCodeAsync(
    { code: authState.params.code, ...config },
    config.serviceConfiguration
  );
  return accessTokenState.accessToken;
};

const rnAppAuth = async (config: Config) => {
  const authState = await authorize(config);
  return authState.accessToken;
};

export default Platform.OS === 'ios' ? expoAuth : rnAppAuth;
