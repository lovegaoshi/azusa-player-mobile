import React, { useEffect, useState, useCallback } from 'react';
import { BackHandler, SafeAreaView, StyleSheet, View } from 'react-native';
import { Button, Avatar, ActivityIndicator } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';
import CookieManager from '@react-native-cookies/cookies';
import { get_current_user } from 'libmuse';
import { useTranslation } from 'react-i18next';

import { saveSecure as saveItem } from '@utils/ChromeStorageAPI';
import { StorageKeys } from '@enums/Storage';
import { User, UseYTMLogin } from './useYTMLogin';
import useCollapsible from '../useCollapsible';
import { initMuse } from '@utils/muse';
import logger from '@utils/Logger';
import { styles as stylesG } from '@components/style';
import { PaperText as Text } from '@components/commonui/ScaledText';

const jsCode = 'window.ReactNativeWebView.postMessage(document.cookie)';

const clearCookies = () => {
  saveItem(StorageKeys.YTMCOOKIES, null);
  initMuse();
};

const checkYTM = async () => {
  await initMuse();
  get_current_user().then(console.log).catch(console.log);
};

const Login = ({ refresh }: { refresh: () => void }) => {
  const { t } = useTranslation();
  const [webView, _setWebView] = useState(false);
  const [cookies, setCookies] = useState<string[]>([]);
  const toggleCollapse = useCollapsible(state => state.toggleCollapse);
  const setWebView = (val: boolean) => {
    _setWebView(val);
    toggleCollapse(val);
  };

  const onMessage = (event: any) => {
    const { data } = event.nativeEvent;
    setCookies(data?.split('; '));
  };

  const closeWebView = () => {
    setWebView(false);
    cookies.forEach(cookie => {
      const [name, value] = cookie.split('=');
      CookieManager.set('https://youtube.com', {
        name,
        value,
      });
    });
    if (cookies.length === 0) {
      logger.error('[YTM] failed to login, as cookie length is 0.');
    }
    saveItem(StorageKeys.YTMCOOKIES, cookies.join('; '))
      .then(() => initMuse().then(refresh))
      .catch(logger.error);
  };

  const checkWebView = () => {
    if (cookies.length === 0) {
      return logger.error('[YTM] failed to login, as cookie length is 0.');
    }
    closeWebView();
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (webView) {
          closeWebView();
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
    <View style={stylesG.flex}>
      <WebView
        style={stylesG.flex}
        source={{
          uri: 'https://accounts.google.com/ServiceLogin?service=youtube&uilel=3&passive=true&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Ddesktop%26hl%3Den%26next%3Dhttps%253A%252F%252Fwww.youtube.com%252F&hl=en&ec=65620',
        }}
        injectedJavaScript={jsCode}
        onMessage={onMessage}
      />
      <Button onPress={checkWebView}>{t('Login.Check')}</Button>
    </View>
  ) : (
    <SafeAreaView>
      {__DEV__ && <Button onPress={checkYTM}>{t('Login.Check')}</Button>}
      <Button onPress={() => setWebView(true)}>{t('Login.Login')}</Button>
      <Button onPress={clearCookies}>{t('Login.Clear')}</Button>
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
  const { user, clear, initialized, init, refresh } = ytmLogin;

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
        saveItem(StorageKeys.YTMCOOKIES, null).then(() => initMuse());
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
