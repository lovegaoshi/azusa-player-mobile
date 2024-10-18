import * as React from 'react';
import { BackHandler, SafeAreaView } from 'react-native';
import { Button } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';
import CookieManager from '@react-native-cookies/cookies';

import useGoogleTVOauth from '@components/login/google/useGoogleTVOauth';

const jsCode = 'window.ReactNativeWebView.postMessage(document.cookie)';

const Explore = () => {
  const [webView, setWebView] = React.useState(false);
  const [cookies, setCookies] = React.useState<string[]>([]);
  const { userURL, getNewLoginCode } = useGoogleTVOauth({ setWebView });

  const onMessage = (event: any) => {
    const { data } = event.nativeEvent;
    setCookies(data?.split(';'));
  };

  useFocusEffect(
    React.useCallback(() => {
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
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }, [webView])
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
          const cookies = await CookieManager.get('https://youtube.com').then(
            v =>
              Object.values(v)
                .map(cookie => `${cookie.name}=${cookie.value}`)
                .join('; ')
          );
        }}
      >
        Check
      </Button>
      <Button onPress={getNewLoginCode}>Login</Button>
    </SafeAreaView>
  );
};

export default Explore;
