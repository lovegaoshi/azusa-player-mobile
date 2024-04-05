import * as React from 'react';
import { BackHandler, SafeAreaView } from 'react-native';
import { Button } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';

import useGoogleTVOauth from '@components/login/google/useGoogleTVOauth';

const Explore = () => {
  const [webView, setWebView] = React.useState(false);
  const { userURL, getNewLoginCode } = useGoogleTVOauth({ setWebView });

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (webView) {
          setWebView(false);
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
    <WebView source={{ uri: userURL }} />
  ) : (
    <SafeAreaView>
      <Button onPress={() => getNewLoginCode().then(console.log)}>Login</Button>
    </SafeAreaView>
  );
};

export default Explore;
