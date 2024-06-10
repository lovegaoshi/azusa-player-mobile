import { loadAsync, exchangeCodeAsync } from 'expo-auth-session';

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

export default async (config: Config) => {
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
