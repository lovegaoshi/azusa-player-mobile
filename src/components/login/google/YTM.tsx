import { useEffect, useState, useCallback } from 'react';
import { BackHandler, SafeAreaView, StyleSheet, View } from 'react-native';
import { Button, Avatar, Text, ActivityIndicator } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';
import CookieManager from '@react-native-cookies/cookies';
import { get_option, get_current_user } from 'libmuse';
import { useTranslation } from 'react-i18next';

import useGoogleTVOauth from '@components/login/google/useGoogleTVOauth';
import { saveSecure as saveItem } from '@utils/ChromeStorageAPI';
import { StorageKeys } from '@enums/Storage';
import { User, UseYTMLogin } from './useYTMLogin';
import { museStore } from '@utils/muse';
import useCollapsible from '../useCollapsible';

const jsCode = 'window.ReactNativeWebView.postMessage(document.cookie)';
const auth = get_option('auth');

interface LoginProps {
  refresh: () => void;
}
const Login = ({ refresh }: LoginProps) => {
  const [webView, _setWebView] = useState(false);
  const [cookies, setCookies] = useState<string[]>([]);
  const toggleCollapse = useCollapsible(state => state.toggleCollapse);
  const setWebView = (val: boolean) => {
    _setWebView(val);
    toggleCollapse(val);
  };
  const { userURL, loginCodes, getNewLoginCode } = useGoogleTVOauth({
    setWebView,
  });

  const onMessage = (event: any) => {
    const { data } = event.nativeEvent;
    setCookies(data?.split(';'));
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (webView) {
          setWebView(false);
          cookies.forEach(cookie => {
            const [name, value] = cookie.split('=');
            CookieManager.set('https://youtube.com', {
              name,
              value,
            });
          });
          auth
            .load_token_with_code(loginCodes!.deviceCode, loginCodes!.interval)
            .then(t => {
              museStore.set('token', t);
              refresh();
            });
          saveItem(StorageKeys.YTMCOOKIES, cookies.join('; '));
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [webView]),
  );

  return webView ? (
    <WebView
      source={{ uri: userURL }}
      injectedJavaScript={jsCode}
      onMessage={onMessage}
    />
  ) : (
    <SafeAreaView>
      <Button
        onPress={async () => {
          console.log(await get_current_user());
        }}
      >
        Check
      </Button>
      <Button onPress={getNewLoginCode}>Login</Button>
    </SafeAreaView>
  );
};

interface LoginPageProps {
  user?: User;
  logout: () => void;
}
const LoggedInPage = ({ user, logout }: LoginPageProps) => {
  const { t } = useTranslation();

  if (!user) return <></>;

  const { handle, name, thumbnails } = user;

  return (
    <View style={styles.loggedInContainerStyle}>
      <View style={styles.avatarContainerStyle}>
        <Avatar.Image source={{ uri: thumbnails[0].url }} size={150} />
        <View style={styles.avatarUsernameStyle}>
          <Text variant="headlineSmall">{`${name}`}</Text>
          <Text variant="headlineSmall">{`${handle}`}</Text>
          <Button onPress={logout}>{t('Login.Logout')}</Button>
        </View>
      </View>
      <Text>{t('Login.Disclaimer')}</Text>
    </View>
  );
};

interface Props {
  ytmLogin: UseYTMLogin;
}
const Explore = ({ ytmLogin }: Props) => {
  const { user, clear, initialized, refresh, init } = ytmLogin;

  useEffect(() => {
    init();
  }, []);

  if (!initialized) {
    return <ActivityIndicator size={100} />;
  }
  return user ? (
    <LoggedInPage
      user={user}
      logout={() => {
        saveItem(StorageKeys.YTMTOKEN, null);
        museStore.set('token', null);
        auth.token = null;
        clear();
      }}
    />
  ) : (
    <Login refresh={refresh} />
  );
};

export default Explore;

/**
          const cookies = await CookieManager.get('https://youtube.com').then(
            v =>
              Object.values(v)
                .map(cookie => `${cookie.name}=${cookie.value}`)
                .join('; '),
          );

 */

const styles = StyleSheet.create({
  loggedInContainerStyle: {
    paddingHorizontal: 5,
  },
  avatarContainerStyle: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingVertical: 10,
    flex: 0,
    flexGrow: 0,
  },
  avatarUsernameStyle: {
    paddingLeft: 10,
    flex: 1,
  },
});
