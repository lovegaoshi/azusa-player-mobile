import React, { useEffect, useState, useCallback } from 'react';
import { BackHandler, SafeAreaView, StyleSheet, View } from 'react-native';
import { Button, Avatar, Text, ActivityIndicator } from 'react-native-paper';
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

const jsCode = 'window.ReactNativeWebView.postMessage(document.cookie)';

const clearCookies = () => {
  saveItem(StorageKeys.YTMCOOKIES, null);
};

const checkYTM = async () => {
  await initMuse();
  get_current_user().then(console.log).catch(console.log);
};

const Login = () => {
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
      source={{
        uri: 'https://accounts.google.com/ServiceLogin?service=youtube&uilel=3&passive=true&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Ddesktop%26hl%3Den%26next%3Dhttps%253A%252F%252Fwww.youtube.com%252F&hl=en&ec=65620',
      }}
      injectedJavaScript={jsCode}
      onMessage={onMessage}
    />
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
  const { user, clear, initialized, init } = ytmLogin;

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
    <Login />
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
